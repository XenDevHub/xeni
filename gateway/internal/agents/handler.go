package agents

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/xeni-ai/gateway/internal/auth"
	"github.com/xeni-ai/gateway/internal/cache"
	"github.com/xeni-ai/gateway/internal/models"
	"github.com/xeni-ai/gateway/internal/rabbitmq"
	"github.com/xeni-ai/gateway/internal/websocket"
	"github.com/xeni-ai/gateway/pkg/response"
)

// Handler holds agent handler dependencies.
type Handler struct {
	DB       *gorm.DB
	Redis    *cache.Client
	RabbitMQ *rabbitmq.Client
	WSHub    *websocket.Hub
}

// NewHandler creates a new agent handler.
func NewHandler(db *gorm.DB, redis *cache.Client, rmq *rabbitmq.Client, wsHub *websocket.Hub) *Handler {
	return &Handler{DB: db, Redis: redis, RabbitMQ: rmq, WSHub: wsHub}
}

// RunAgent handles POST /:agent-slug/run — submits a new task.
func (h *Handler) RunAgent(c *fiber.Ctx) error {
	agentSlug := c.Params("slug")
	userID := c.Locals("user_id").(string)

	// Validate agent type
	agentType, ok := models.AgentSlugToType[agentSlug]
	if !ok {
		return response.NotFound(c, "Agent not found")
	}

	// Check subscription access
	subInfo, err := auth.GetUserSubscription(h.DB, h.Redis, userID)
	if err != nil {
		return response.InternalError(c)
	}

	// Check agent access
	hasAccess := false
	for _, a := range subInfo.Agents {
		if a == string(agentType) {
			hasAccess = true
			break
		}
	}
	if !hasAccess {
		return response.UpgradeRequired(c, getRequiredPlan(agentType))
	}

	// Check daily task limit
	if subInfo.MaxTasksPerDay > 0 {
		uid, _ := uuid.Parse(userID)
		var todayCount int64
		today := time.Now().Truncate(24 * time.Hour)
		h.DB.Model(&models.AgentTask{}).Where("user_id = ? AND created_at >= ?", uid, today).Count(&todayCount)

		if int(todayCount) >= subInfo.MaxTasksPerDay {
			return response.Forbidden(c, "Daily task limit reached. Upgrade your plan for more.")
		}
	}

	// Parse payload
	var payload map[string]interface{}
	if err := c.BodyParser(&payload); err != nil {
		payload = make(map[string]interface{})
	}

	// Create task record
	uid, _ := uuid.Parse(userID)
	taskID := uuid.New()
	task := models.AgentTask{
		UserID:    uid,
		AgentType: agentType,
		TaskID:    taskID,
		Status:    models.TaskQueued,
	}
	if err := h.DB.Create(&task).Error; err != nil {
		slog.Error("failed to create agent task", "error", err)
		return response.InternalError(c)
	}

	// Get the routing key for this agent
	routingKey, ok := models.AgentTypeToQueue[agentType]
	if !ok {
		return response.InternalError(c)
	}

	// Publish to RabbitMQ
	msg := &rabbitmq.TaskMessage{
		TaskID:     taskID.String(),
		UserID:     userID,
		AgentType:  routingKey,
		Priority:   5,
		RetryCount: 0,
		CreatedAt:  time.Now().UTC().Format(time.RFC3339),
		Payload:    payload,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := h.RabbitMQ.PublishTask(ctx, msg); err != nil {
		slog.Error("failed to publish task to RabbitMQ", "task_id", taskID, "error", err)
		h.DB.Model(&task).Update("status", models.TaskFailed)
		return response.InternalError(c)
	}

	return response.Created(c, map[string]interface{}{
		"task_id":    taskID,
		"agent_type": agentType,
		"status":     "queued",
	})
}

// GetTasks returns user's task history for an agent.
func (h *Handler) GetTasks(c *fiber.Ctx) error {
	agentSlug := c.Params("slug")
	userID := c.Locals("user_id").(string)
	uid, _ := uuid.Parse(userID)

	agentType, ok := models.AgentSlugToType[agentSlug]
	if !ok {
		return response.NotFound(c, "Agent not found")
	}

	page := c.QueryInt("page", 1)
	perPage := c.QueryInt("per_page", 20)
	if perPage > 100 {
		perPage = 100
	}

	var tasks []models.AgentTask
	var total int64

	query := h.DB.Where("user_id = ? AND agent_type = ?", uid, agentType)
	query.Model(&models.AgentTask{}).Count(&total)
	query.Order("created_at DESC").Offset((page - 1) * perPage).Limit(perPage).Find(&tasks)

	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPages++
	}

	return response.SuccessWithMeta(c, tasks, response.PaginationMeta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
	})
}

// GetTask returns a specific task's status and result.
func (h *Handler) GetTask(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	uid, _ := uuid.Parse(userID)
	taskID := c.Params("taskId")
	tid, err := uuid.Parse(taskID)
	if err != nil {
		return response.BadRequest(c, "Invalid task ID")
	}

	var task models.AgentTask
	if err := h.DB.Where("task_id = ? AND user_id = ?", tid, uid).First(&task).Error; err != nil {
		return response.NotFound(c, "Task not found")
	}

	return response.Success(c, task)
}

// DeleteTask deletes a task result.
func (h *Handler) DeleteTask(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	uid, _ := uuid.Parse(userID)
	taskID := c.Params("taskId")
	tid, err := uuid.Parse(taskID)
	if err != nil {
		return response.BadRequest(c, "Invalid task ID")
	}

	result := h.DB.Where("task_id = ? AND user_id = ?", tid, uid).Delete(&models.AgentTask{})
	if result.RowsAffected == 0 {
		return response.NotFound(c, "Task not found")
	}

	return response.Success(c, map[string]string{"message": "Task deleted successfully"})
}

// HandleResult processes a result message from RabbitMQ and updates the task.
func (h *Handler) HandleResult(result rabbitmq.ResultMessage) error {
	tid, _ := uuid.Parse(result.TaskID)

	updates := map[string]interface{}{
		"status":      result.Status,
		"duration_ms": result.DurationMs,
	}

	if result.MongoDocID != "" {
		updates["mongo_doc_id"] = result.MongoDocID
	}

	if result.Error != nil {
		updates["error_message"] = *result.Error
	}

	now := time.Now()
	updates["completed_at"] = &now

	h.DB.Model(&models.AgentTask{}).Where("task_id = ?", tid).Updates(updates)

	// If the AI Worker processed an order successfully, update the real Order table
	if result.AgentType == "order" && result.Status == "completed" && result.Data != nil {
		if orderIDStr, ok := result.Data["order_id"].(string); ok && orderIDStr != "" {
			if orderID, err := uuid.Parse(orderIDStr); err == nil {
				orderUpdates := make(map[string]interface{})
				if ps, ok := result.Data["payment_status"].(string); ok && ps != "" {
					orderUpdates["payment_status"] = ps
				}
				if ds, ok := result.Data["delivery_status"].(string); ok && ds != "" {
					orderUpdates["delivery_status"] = ds
				}
				if tn, ok := result.Data["tracking_number"].(string); ok && tn != "" {
					orderUpdates["tracking_number"] = tn
				}
				if cn, ok := result.Data["courier_name"].(string); ok && cn != "" {
					orderUpdates["courier_name"] = cn
				}
				if cb, ok := result.Data["courier_booking"].(map[string]interface{}); ok {
					if cbBytes, err := json.Marshal(cb); err == nil {
						orderUpdates["courier_booking_response"] = cbBytes
					}
				}

				if len(orderUpdates) > 0 {
					h.DB.Model(&models.Order{}).Where("id = ?", orderID).Updates(orderUpdates)
					slog.Info("Order updated by AI Agent", "order_id", orderIDStr, "updates", orderUpdates)
				}
			}
		}
	}

	// Send WebSocket notification
	taskIDStr := result.TaskID
	h.WSHub.SendToUser(result.UserID, websocket.Event{
		EventType: "task." + result.Status,
		TaskID:    &taskIDStr,
		Payload: map[string]interface{}{
			"agent_type":  result.AgentType,
			"summary":     result.Summary,
			"duration_ms": result.DurationMs,
		},
	})

	return nil
}

// getRequiredPlan returns the minimum plan required for an agent.
func getRequiredPlan(agentType models.AgentType) string {
	switch agentType {
	case models.AgentConversation:
		return "starter"
	case models.AgentOrder, models.AgentInventory:
		return "professional"
	case models.AgentCreative, models.AgentIntelligence:
		return "premium"
	default:
		return "professional"
	}
}

// SubscriptionAccessMiddleware is a convenience for checking plan access for agent routes.
func (h *Handler) SubscriptionAccessMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Access check happens in RunAgent, so just pass through for listing
		return c.Next()
	}
}

// ── Helper for JSON response from MongoDB result ──

type AgentResult struct {
	TaskID      string          `json:"task_id"`
	AgentType   string          `json:"agent_type"`
	Status      string          `json:"status"`
	Input       json.RawMessage `json:"input"`
	Result      json.RawMessage `json:"result"`
	ReportURL   *string         `json:"s3_report_url"`
	CreatedAt   string          `json:"created_at"`
	CompletedAt *string         `json:"completed_at"`
}
