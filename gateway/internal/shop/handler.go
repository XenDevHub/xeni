package shop

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/xeni-ai/gateway/internal/models"
	"github.com/xeni-ai/gateway/pkg/response"
)

// Handler holds shop dependencies.
type Handler struct {
	DB *gorm.DB
}

// NewHandler creates a new shop handler.
func NewHandler(db *gorm.DB) *Handler {
	return &Handler{DB: db}
}

// CreateShop handles POST /api/shops — create a shop for the current user.
func (h *Handler) CreateShop(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	uid, _ := uuid.Parse(userID)

	// Check if user already has a shop
	var existing models.Shop
	if err := h.DB.Where("user_id = ?", uid).First(&existing).Error; err == nil {
		return response.BadRequest(c, "You already have a shop. Use PUT to update.")
	}

	var req struct {
		ShopName            string  `json:"shop_name"`
		ShopDescription     *string `json:"shop_description"`
		ShopLogoURL         *string `json:"shop_logo_url"`
		PreferredLanguage   string  `json:"preferred_language"`
		CourierPreference   string  `json:"courier_preference"`
		BkashMerchantNumber *string `json:"bkash_merchant_number"`
		NagadMerchantNumber *string `json:"nagad_merchant_number"`
	}
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}
	if req.ShopName == "" {
		return response.BadRequest(c, "shop_name is required")
	}
	if req.PreferredLanguage == "" {
		req.PreferredLanguage = "bn"
	}
	if req.CourierPreference == "" {
		req.CourierPreference = "pathao"
	}

	shop := models.Shop{
		UserID:              uid,
		ShopName:            req.ShopName,
		ShopDescription:     req.ShopDescription,
		ShopLogoURL:         req.ShopLogoURL,
		PreferredLanguage:   req.PreferredLanguage,
		CourierPreference:   req.CourierPreference,
		BkashMerchantNumber: req.BkashMerchantNumber,
		NagadMerchantNumber: req.NagadMerchantNumber,
	}

	if err := h.DB.Create(&shop).Error; err != nil {
		return response.InternalError(c)
	}

	return response.Created(c, shop)
}

// GetMyShop handles GET /api/shops/me — get current user's shop.
func (h *Handler) GetMyShop(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	uid, _ := uuid.Parse(userID)

	var shop models.Shop
	if err := h.DB.Preload("ConnectedPages").Where("user_id = ?", uid).First(&shop).Error; err != nil {
		return response.NotFound(c, "No shop found. Create one first.")
	}

	return response.Success(c, shop)
}

// UpdateMyShop handles PUT /api/shops/me — update current user's shop.
func (h *Handler) UpdateMyShop(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	uid, _ := uuid.Parse(userID)

	var shop models.Shop
	if err := h.DB.Where("user_id = ?", uid).First(&shop).Error; err != nil {
		return response.NotFound(c, "No shop found")
	}

	var req struct {
		ShopName            *string `json:"shop_name"`
		ShopDescription     *string `json:"shop_description"`
		ShopLogoURL         *string `json:"shop_logo_url"`
		PreferredLanguage   *string `json:"preferred_language"`
		CourierPreference   *string `json:"courier_preference"`
		BkashMerchantNumber *string                 `json:"bkash_merchant_number"`
		NagadMerchantNumber *string                 `json:"nagad_merchant_number"`
		AutoReplyEnabled    *bool                   `json:"auto_reply_enabled"`
		AutoOrderEnabled    *bool                   `json:"auto_order_enabled"`
		Integrations        *map[string]interface{} `json:"integrations"`
		CustomAgentRules    *string                 `json:"custom_agent_rules"`
	}
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	updates := make(map[string]interface{})
	if req.ShopName != nil {
		updates["shop_name"] = *req.ShopName
	}
	if req.ShopDescription != nil {
		updates["shop_description"] = *req.ShopDescription
	}
	if req.ShopLogoURL != nil {
		updates["shop_logo_url"] = *req.ShopLogoURL
	}
	if req.PreferredLanguage != nil {
		updates["preferred_language"] = *req.PreferredLanguage
	}
	if req.CourierPreference != nil {
		updates["courier_preference"] = *req.CourierPreference
	}
	if req.BkashMerchantNumber != nil {
		updates["bkash_merchant_number"] = *req.BkashMerchantNumber
	}
	if req.NagadMerchantNumber != nil {
		updates["nagad_merchant_number"] = *req.NagadMerchantNumber
	}
	if req.AutoReplyEnabled != nil {
		updates["auto_reply_enabled"] = *req.AutoReplyEnabled
	}
	if req.AutoOrderEnabled != nil {
		updates["auto_order_enabled"] = *req.AutoOrderEnabled
	}
	if req.Integrations != nil {
		updates["integrations"] = *req.Integrations
	}
	if req.CustomAgentRules != nil {
		updates["custom_agent_rules"] = *req.CustomAgentRules
	}

	if len(updates) > 0 {
		h.DB.Model(&shop).Updates(updates)
	}

	h.DB.Preload("ConnectedPages").First(&shop, shop.ID)
	return response.Success(c, shop)
}
