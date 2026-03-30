package orders

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/xeni-ai/gateway/internal/models"
	"github.com/xeni-ai/gateway/pkg/response"
)

// Handler holds order dependencies.
type Handler struct {
	DB *gorm.DB
}

// NewHandler creates a new orders handler.
func NewHandler(db *gorm.DB) *Handler {
	return &Handler{DB: db}
}

func (h *Handler) getUserShop(userID string) (*models.Shop, error) {
	uid, _ := uuid.Parse(userID)
	var shop models.Shop
	err := h.DB.Where("user_id = ?", uid).First(&shop).Error
	return &shop, err
}

// ListOrders handles GET /api/orders.
func (h *Handler) ListOrders(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	shop, err := h.getUserShop(userID)
	if err != nil {
		return response.Success(c, []models.Order{})
	}

	page := c.QueryInt("page", 1)
	perPage := c.QueryInt("per_page", 20)
	paymentStatus := c.Query("payment_status")
	deliveryStatus := c.Query("delivery_status")

	if perPage > 100 {
		perPage = 100
	}

	query := h.DB.Where("shop_id = ?", shop.ID)
	if paymentStatus != "" {
		query = query.Where("payment_status = ?", paymentStatus)
	}
	if deliveryStatus != "" {
		query = query.Where("delivery_status = ?", deliveryStatus)
	}

	var total int64
	query.Model(&models.Order{}).Count(&total)

	var orders []models.Order
	query.Order("created_at DESC").Offset((page - 1) * perPage).Limit(perPage).Find(&orders)

	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPages++
	}

	return response.SuccessWithMeta(c, orders, response.PaginationMeta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
	})
}

// GetOrder handles GET /api/orders/:id.
func (h *Handler) GetOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	shop, err := h.getUserShop(userID)
	if err != nil {
		return response.NotFound(c, "Shop not found")
	}

	oid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid order ID")
	}

	var order models.Order
	if err := h.DB.Where("id = ? AND shop_id = ?", oid, shop.ID).First(&order).Error; err != nil {
		return response.NotFound(c, "Order not found")
	}

	return response.Success(c, order)
}

// CreateOrder handles POST /api/orders — create a manual order.
func (h *Handler) CreateOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	shop, err := h.getUserShop(userID)
	if err != nil {
		return response.BadRequest(c, "Create a shop first")
	}

	var req struct {
		CustomerName    *string  `json:"customer_name"`
		CustomerPhone   *string  `json:"customer_phone"`
		CustomerAddress *string  `json:"customer_address"`
		TotalAmount     float64  `json:"total_amount"`
		PaymentMethod   *string  `json:"payment_method"`
		Notes           *string  `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	order := models.Order{
		ShopID:          shop.ID,
		CustomerName:    req.CustomerName,
		CustomerPhone:   req.CustomerPhone,
		CustomerAddress: req.CustomerAddress,
		TotalAmount:     req.TotalAmount,
		PaymentStatus:   models.OrderPayPending,
		DeliveryStatus:  models.DeliveryPending,
		PlacedBy:        models.PlacedByHuman,
		Notes:           req.Notes,
	}

	if req.PaymentMethod != nil {
		pm := models.OrderPaymentMethod(*req.PaymentMethod)
		order.PaymentMethod = &pm
	}

	if err := h.DB.Create(&order).Error; err != nil {
		return response.InternalError(c)
	}

	return response.Created(c, order)
}

// UpdateOrder handles PUT /api/orders/:id.
func (h *Handler) UpdateOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	shop, err := h.getUserShop(userID)
	if err != nil {
		return response.NotFound(c, "Shop not found")
	}

	oid, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.BadRequest(c, "Invalid order ID")
	}

	var order models.Order
	if err := h.DB.Where("id = ? AND shop_id = ?", oid, shop.ID).First(&order).Error; err != nil {
		return response.NotFound(c, "Order not found")
	}

	var req struct {
		PaymentStatus  *string `json:"payment_status"`
		DeliveryStatus *string `json:"delivery_status"`
		TrackingNumber *string `json:"tracking_number"`
		CourierName    *string `json:"courier_name"`
		Notes          *string `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	updates := make(map[string]interface{})
	if req.PaymentStatus != nil {
		updates["payment_status"] = *req.PaymentStatus
	}
	if req.DeliveryStatus != nil {
		updates["delivery_status"] = *req.DeliveryStatus
	}
	if req.TrackingNumber != nil {
		updates["tracking_number"] = *req.TrackingNumber
	}
	if req.CourierName != nil {
		updates["courier_name"] = *req.CourierName
	}
	if req.Notes != nil {
		updates["notes"] = *req.Notes
	}

	if len(updates) > 0 {
		h.DB.Model(&order).Updates(updates)
	}

	h.DB.First(&order, order.ID)
	return response.Success(c, order)
}

// GetOrderStats handles GET /api/orders/stats — get order statistics.
func (h *Handler) GetOrderStats(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	shop, err := h.getUserShop(userID)
	if err != nil {
		return response.Success(c, map[string]int64{})
	}

	var totalOrders, pendingPayment, pendingDelivery int64
	var totalRevenue float64

	h.DB.Model(&models.Order{}).Where("shop_id = ?", shop.ID).Count(&totalOrders)
	h.DB.Model(&models.Order{}).Where("shop_id = ? AND payment_status = 'pending'", shop.ID).Count(&pendingPayment)
	h.DB.Model(&models.Order{}).Where("shop_id = ? AND delivery_status = 'pending'", shop.ID).Count(&pendingDelivery)

	var result struct{ Sum float64 }
	h.DB.Model(&models.Order{}).Where("shop_id = ? AND payment_status = 'verified'", shop.ID).Select("COALESCE(SUM(total_amount), 0) as sum").Scan(&result)
	totalRevenue = result.Sum

	return response.Success(c, map[string]interface{}{
		"total_orders":     totalOrders,
		"pending_payment":  pendingPayment,
		"pending_delivery": pendingDelivery,
		"total_revenue":    totalRevenue,
	})
}
