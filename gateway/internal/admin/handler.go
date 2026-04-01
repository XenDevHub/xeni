package admin

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/xeni-ai/gateway/internal/models"
	"github.com/xeni-ai/gateway/pkg/response"
)

type Handler struct {
	DB *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{DB: db}
}

func (h *Handler) ListUsers(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	perPage := c.QueryInt("per_page", 20)
	if perPage > 100 {
		perPage = 100
	}

	var users []models.User
	var total int64
	h.DB.Model(&models.User{}).Count(&total)
	h.DB.Order("created_at DESC").Offset((page - 1) * perPage).Limit(perPage).Find(&users)

	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPages++
	}

	return response.SuccessWithMeta(c, users, response.PaginationMeta{
		Page: page, PerPage: perPage, Total: total, TotalPages: totalPages,
	})
}

func (h *Handler) UpdateUserStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		return response.BadRequest(c, "Invalid user ID")
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	status := models.UserStatus(req.Status)
	if status != models.StatusActive && status != models.StatusSuspended {
		return response.BadRequest(c, "Status must be 'active' or 'suspended'")
	}

	result := h.DB.Model(&models.User{}).Where("id = ?", uid).Update("status", status)
	if result.RowsAffected == 0 {
		return response.NotFound(c, "User not found")
	}
	return response.Success(c, map[string]string{"message": "User status updated"})
}

func (h *Handler) UpdateUserRole(c *fiber.Ctx) error {
	id := c.Params("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		return response.BadRequest(c, "Invalid user ID")
	}

	var req struct {
		Role string `json:"role"`
	}
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body")
	}

	role := models.UserRole(req.Role)
	if role != models.RoleUser && role != models.RoleAdmin && role != models.RoleSuperAdmin {
		return response.BadRequest(c, "Role must be 'user', 'admin', or 'super_admin'")
	}

	result := h.DB.Model(&models.User{}).Where("id = ?", uid).Update("role", role)
	if result.RowsAffected == 0 {
		return response.NotFound(c, "User not found")
	}
	return response.Success(c, map[string]string{"message": "User role updated"})
}

func (h *Handler) ListAllTasks(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	perPage := c.QueryInt("per_page", 20)

	var tasks []models.AgentTask
	var total int64
	h.DB.Model(&models.AgentTask{}).Count(&total)
	h.DB.Order("created_at DESC").Offset((page - 1) * perPage).Limit(perPage).Find(&tasks)

	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPages++
	}

	return response.SuccessWithMeta(c, tasks, response.PaginationMeta{
		Page: page, PerPage: perPage, Total: total, TotalPages: totalPages,
	})
}

func (h *Handler) GetMetrics(c *fiber.Ctx) error {
	var userCount, taskCount, activeSubCount int64
	h.DB.Model(&models.User{}).Count(&userCount)
	h.DB.Model(&models.AgentTask{}).Count(&taskCount)
	h.DB.Model(&models.Subscription{}).Where("status = ?", models.SubActive).Count(&activeSubCount)

	var tasksByAgent []struct {
		AgentType string `json:"agent_type"`
		Count     int64  `json:"count"`
	}
	h.DB.Model(&models.AgentTask{}).Select("agent_type, count(*) as count").Group("agent_type").Scan(&tasksByAgent)

	return response.Success(c, map[string]interface{}{
		"total_users":          userCount,
		"total_tasks":          taskCount,
		"active_subscriptions": activeSubCount,
		"tasks_by_agent":       tasksByAgent,
	})
}
