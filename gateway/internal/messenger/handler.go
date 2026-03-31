package messenger

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"log/slog"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/xeni-ai/gateway/internal/config"
	"github.com/xeni-ai/gateway/internal/models"
	"github.com/xeni-ai/gateway/internal/rabbitmq"
)

// Handler holds messenger webhook dependencies.
type Handler struct {
	DB       *gorm.DB
	Config   *config.Config
	RabbitMQ *rabbitmq.Client
}

// NewHandler creates a new messenger webhook handler.
func NewHandler(db *gorm.DB, cfg *config.Config, rmq *rabbitmq.Client) *Handler {
	return &Handler{DB: db, Config: cfg, RabbitMQ: rmq}
}

// WebhookVerify handles GET /api/webhooks/messenger — Meta webhook verification.
func (h *Handler) WebhookVerify(c *fiber.Ctx) error {
	mode := c.Query("hub.mode")
	token := c.Query("hub.verify_token")
	challenge := c.Query("hub.challenge")

	if mode == "subscribe" && token == h.Config.Meta.WebhookVerifyToken {
		slog.Info("Messenger webhook verified")
		return c.SendString(challenge)
	}

	return c.Status(403).SendString("Verification failed")
}

// WebhookReceive handles POST /api/webhooks/messenger — receive messages from Meta.
func (h *Handler) WebhookReceive(c *fiber.Ctx) error {
	// Validate X-Hub-Signature-256
	signature := c.Get("X-Hub-Signature-256")
	body := c.Body()

	if h.Config.Meta.AppSecret != "" && !h.verifySignature(body, signature) {
		slog.Warn("Invalid messenger webhook signature")
		return c.SendStatus(403)
	}

	var webhook WebhookPayload
	if err := json.Unmarshal(body, &webhook); err != nil {
		slog.Error("failed to parse webhook payload", "error", err)
		return c.SendStatus(200) // Always return 200 to Meta
	}

	// Process each entry
	for _, entry := range webhook.Entry {
		pageID := entry.ID
		for _, messaging := range entry.Messaging {
			if messaging.Message != nil {
				go h.handleIncomingMessage(pageID, messaging)
			}
		}
	}

	// Always return 200 quickly — Meta will retry on non-200
	return c.SendStatus(200)
}

func (h *Handler) handleIncomingMessage(pageID string, event MessagingEvent) {
	senderPSID := event.Sender.ID

	// Find the connected page
	var page models.ConnectedPage
	if err := h.DB.Where("page_id = ? AND is_active = true", pageID).First(&page).Error; err != nil {
		slog.Warn("received message for unconnected page", "page_id", pageID)
		return
	}

	// Find or create conversation
	var conv models.Conversation
	err := h.DB.Where("page_id = ? AND customer_psid = ?", pageID, senderPSID).First(&conv).Error
	if err == gorm.ErrRecordNotFound {
		conv = models.Conversation{
			ShopID:       page.ShopID,
			PageID:       pageID,
			CustomerPSID: senderPSID,
			Status:       models.ConversationOpen,
			HandlingMode: models.HandlingModeAI,
		}
		h.DB.Create(&conv)
	}

	// Extract message content
	var contentText *string
	var contentType models.MessageContentType = models.ContentText
	var contentURL *string

	if event.Message.Text != "" {
		contentText = &event.Message.Text
	}
	if len(event.Message.Attachments) > 0 {
		att := event.Message.Attachments[0]
		if att.Type == "image" {
			contentType = models.ContentImage
			contentURL = &att.Payload.URL
		} else if att.Type == "audio" {
			contentType = models.ContentAudio
			contentURL = &att.Payload.URL
		}
	}

	// Save message (with deduplication via messenger_mid)
	mid := event.Message.MID
	msg := models.Message{
		ConversationID: conv.ID,
		Direction:      models.DirectionInbound,
		SenderType:     models.SenderCustomer,
		ContentType:    contentType,
		ContentText:    contentText,
		ContentURL:     contentURL,
		MessengerMID:   &mid,
	}
	if err := h.DB.Create(&msg).Error; err != nil {
		slog.Error("failed to save message (possible duplicate)", "mid", mid, "error", err)
		return
	}

	// Update conversation metadata
	preview := ""
	if contentText != nil {
		preview = *contentText
		if len(preview) > 100 {
			preview = preview[:100] + "..."
		}
	} else {
		preview = "[" + string(contentType) + "]"
	}
	now := time.Now()
	h.DB.Model(&conv).Updates(map[string]interface{}{
		"last_message_preview": preview,
		"last_message_at":      &now,
		"unread_count":         gorm.Expr("unread_count + 1"),
	})

	// If conversation is in AI mode, dispatch to conversation worker via RabbitMQ
	if conv.HandlingMode == models.HandlingModeAI && h.RabbitMQ != nil {
		taskID := uuid.New()
		taskMsg := &rabbitmq.TaskMessage{
			TaskID:    taskID.String(),
			UserID:    "", // Will be resolved via shop
			AgentType: "conversation",
			Priority:  10, // High priority for real-time conversations
			CreatedAt: time.Now().UTC().Format(time.RFC3339),
			Payload: map[string]interface{}{
				"conversation_id":   conv.ID.String(),
				"shop_id":           page.ShopID.String(),
				"page_id":           pageID,
				"page_access_token": page.PageAccessToken,
				"customer_psid":     senderPSID,
				"message_text":      contentText,
				"message_type":      string(contentType),
				"message_url":       contentURL,
			},
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := h.RabbitMQ.PublishTask(ctx, taskMsg); err != nil {
			slog.Error("failed to dispatch conversation task", "error", err)
		} else {
			slog.Info("conversation task dispatched", "task_id", taskID, "psid", senderPSID)
		}
	}
}

func (h *Handler) verifySignature(body []byte, signature string) bool {
	if len(signature) < 8 || signature[:7] != "sha256=" {
		return false
	}
	mac := hmac.New(sha256.New, []byte(h.Config.Meta.AppSecret))
	mac.Write(body)
	expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}

// ── Webhook Payload Types ──

type WebhookPayload struct {
	Object string         `json:"object"`
	Entry  []WebhookEntry `json:"entry"`
}

type WebhookEntry struct {
	ID        string           `json:"id"`
	Time      int64            `json:"time"`
	Messaging []MessagingEvent `json:"messaging"`
}

type MessagingEvent struct {
	Sender    WebhookUser     `json:"sender"`
	Recipient WebhookUser     `json:"recipient"`
	Timestamp int64           `json:"timestamp"`
	Message   *WebhookMessage `json:"message,omitempty"`
}

type WebhookUser struct {
	ID string `json:"id"`
}

type WebhookMessage struct {
	MID         string              `json:"mid"`
	Text        string              `json:"text"`
	Attachments []WebhookAttachment `json:"attachments,omitempty"`
}

type WebhookAttachment struct {
	Type    string                   `json:"type"`
	Payload WebhookAttachmentPayload `json:"payload"`
}

type WebhookAttachmentPayload struct {
	URL string `json:"url"`
}
