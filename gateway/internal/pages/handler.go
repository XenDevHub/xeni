package pages

import (
	"log/slog"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/xeni-ai/gateway/internal/models"
	"github.com/xeni-ai/gateway/pkg/response"
)

// Handler holds Facebook pages dependencies.
type Handler struct {
	DB *gorm.DB
}

// NewHandler creates a new pages handler.
func NewHandler(db *gorm.DB) *Handler {
	return &Handler{DB: db}
}

// ConnectPage handles POST /api/pages/connect — connect a Facebook Page.
func (h *Handler) ConnectPage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	uid, _ := uuid.Parse(userID)

	// Get user's shop
	var shop models.Shop
	if err := h.DB.Where("user_id = ?", uid).First(&shop).Error; err != nil {
		return response.BadRequest(c, "Create a shop first before connecting pages")
	}

	var req struct {
		PageID          string  `json:"page_id"`
		PageName        string  `json:"page_name"`
		PageAccessToken string  `json:"page_access_token"`
		PagePictureURL  *string `json:"page_picture_url"`
	}
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}
	if req.PageID == "" || req.PageName == "" || req.PageAccessToken == "" {
		return response.BadRequest(c, "page_id, page_name, and page_access_token are required")
	}

	// Check if page is already connected
	var existing models.ConnectedPage
	if err := h.DB.Where("page_id = ?", req.PageID).First(&existing).Error; err == nil {
		return response.BadRequest(c, "This page is already connected")
	}

	// In production: exchange short-lived token for long-lived, encrypt with AES-256
	// For now, store the token as-is (dev mode)
	page := models.ConnectedPage{
		ShopID:            shop.ID,
		PageID:            req.PageID,
		PageName:          req.PageName,
		PageAccessToken:   req.PageAccessToken,
		PagePictureURL:    req.PagePictureURL,
		WebhookSubscribed: true, // In production: call Graph API to subscribe
		IsActive:          true,
	}

	if err := h.DB.Create(&page).Error; err != nil {
		slog.Error("failed to connect page", "error", err)
		return response.InternalError(c)
	}

	slog.Info("Facebook page connected", "page_id", req.PageID, "shop_id", shop.ID)

	return response.Created(c, page)
}

// ListPages handles GET /api/pages — list all connected pages for the user's shop.
func (h *Handler) ListPages(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	uid, _ := uuid.Parse(userID)

	var shop models.Shop
	if err := h.DB.Where("user_id = ?", uid).First(&shop).Error; err != nil {
		return response.Success(c, []models.ConnectedPage{})
	}

	var pages []models.ConnectedPage
	h.DB.Where("shop_id = ?", shop.ID).Order("connected_at DESC").Find(&pages)

	return response.Success(c, pages)
}

// DisconnectPage handles DELETE /api/pages/:id — disconnect a Facebook Page.
func (h *Handler) DisconnectPage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	uid, _ := uuid.Parse(userID)
	pageDBID := c.Params("id")

	var shop models.Shop
	if err := h.DB.Where("user_id = ?", uid).First(&shop).Error; err != nil {
		return response.NotFound(c, "Shop not found")
	}

	pid, err := uuid.Parse(pageDBID)
	if err != nil {
		return response.BadRequest(c, "Invalid page ID")
	}

	result := h.DB.Where("id = ? AND shop_id = ?", pid, shop.ID).Delete(&models.ConnectedPage{})
	if result.RowsAffected == 0 {
		return response.NotFound(c, "Page not found")
	}

	return response.Success(c, map[string]string{"message": "Page disconnected successfully"})
}
