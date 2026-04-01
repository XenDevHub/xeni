package router

import (
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	fiberlogger "github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"github.com/xeni-ai/gateway/internal/admin"
	"github.com/xeni-ai/gateway/internal/agents"
	"github.com/xeni-ai/gateway/internal/auth"
	"github.com/xeni-ai/gateway/internal/billing"
	"github.com/xeni-ai/gateway/internal/cache"
	"github.com/xeni-ai/gateway/internal/config"
	"github.com/xeni-ai/gateway/internal/conversations"
	"github.com/xeni-ai/gateway/internal/messenger"
	"github.com/xeni-ai/gateway/internal/middleware"
	"github.com/xeni-ai/gateway/internal/models"
	"github.com/xeni-ai/gateway/internal/orders"
	"github.com/xeni-ai/gateway/internal/pages"
	"github.com/xeni-ai/gateway/internal/products"
	"github.com/xeni-ai/gateway/internal/rabbitmq"
	"github.com/xeni-ai/gateway/internal/shop"
	"github.com/xeni-ai/gateway/internal/storage"
	"github.com/xeni-ai/gateway/internal/user"
	ws "github.com/xeni-ai/gateway/internal/websocket"
	"github.com/xeni-ai/gateway/pkg/email"
	jwtPkg "github.com/xeni-ai/gateway/pkg/jwt"

	"gorm.io/gorm"
)

// Setup configures all routes for the Fiber application.
func Setup(
	app *fiber.App,
	cfg *config.Config,
	db *gorm.DB,
	redis *cache.Client,
	jwtManager *jwtPkg.Manager,
	wsHub *ws.Hub,
	agentHandler *agents.Handler,
	rmqClient *rabbitmq.Client,
	spacesClient *storage.SpacesClient,
) {
	// ── Global Middleware ──
	app.Use(recover.New())
	app.Use(fiberlogger.New(fiberlogger.Config{
		Format: "${time} | ${status} | ${latency} | ${ip} | ${method} ${path}\n",
	}))
	app.Use(middleware.RequestIDMiddleware())
	app.Use(middleware.SecurityHeadersMiddleware())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.App.FrontendURL,
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Request-ID",
		AllowCredentials: true,
	}))

	// ── Health Check ──
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "xeni-gateway"})
	})

	// Prometheus metrics endpoint
	app.Get("/metrics", func(c *fiber.Ctx) error {
		return c.SendString("# HELP xeni_gateway_up Gateway is running\n# TYPE xeni_gateway_up gauge\nxeni_gateway_up 1\n")
	})

	api := app.Group("/api")

	// ── Messenger Webhook (no auth — called by Meta) ──
	messengerHandler := messenger.NewHandler(db, cfg, rmqClient)
	api.Get("/webhooks/messenger", messengerHandler.WebhookVerify)
	api.Post("/webhooks/messenger", messengerHandler.WebhookReceive)

	// ── Auth Routes ──
	emailSvc := email.NewResendService(cfg.Email.ResendAPIKey, cfg.Email.FromEmail)
	authHandler := auth.NewHandler(db, redis, jwtManager, cfg.App.FrontendURL, emailSvc)
	authGroup := api.Group("/auth")
	authRateLimit := middleware.RateLimitMiddleware(redis, 5, time.Minute, "auth")

	authGroup.Post("/register", authRateLimit, authHandler.Register)
	authGroup.Post("/login", authRateLimit, authHandler.Login)
	authGroup.Post("/refresh", authRateLimit, authHandler.RefreshToken)
	authGroup.Post("/verify-email", authRateLimit, authHandler.VerifyEmail)
	authGroup.Post("/resend-otp", authRateLimit, authHandler.ResendOTP)
	authGroup.Post("/forgot-password", authRateLimit, authHandler.ForgotPassword)
	authGroup.Post("/reset-password", authRateLimit, authHandler.ResetPassword)
	authGroup.Post("/google/callback", authRateLimit, authHandler.GoogleCallback)
	authGroup.Post("/facebook/callback", authRateLimit, authHandler.FacebookCallback)

	// Auth routes that require authentication
	authProtected := authGroup.Group("", middleware.AuthMiddleware(jwtManager, redis))
	authProtected.Post("/logout", authHandler.Logout)
	authProtected.Post("/2fa/enable", authHandler.Enable2FA)
	authProtected.Post("/2fa/verify", authHandler.Verify2FA)

	// ── User Routes ──
	userHandler := user.NewHandler(db)
	userGroup := api.Group("/user", middleware.AuthMiddleware(jwtManager, redis))
	apiRateLimit := middleware.RateLimitMiddleware(redis, cfg.RateLimit.Requests, cfg.RateLimit.Window, "api")
	userGroup.Use(apiRateLimit)

	userGroup.Get("/me", userHandler.GetMe)
	userGroup.Put("/me", userHandler.UpdateMe)
	userGroup.Put("/me/password", userHandler.ChangePassword)
	userGroup.Post("/me/avatar", userHandler.UploadAvatar)

	// ── Shop Routes ──
	shopHandler := shop.NewHandler(db)
	shopGroup := api.Group("/shops", middleware.AuthMiddleware(jwtManager, redis), apiRateLimit)
	shopGroup.Post("", shopHandler.CreateShop)
	shopGroup.Get("/me", shopHandler.GetMyShop)
	shopGroup.Put("/me", shopHandler.UpdateMyShop)

	// ── Facebook Pages Routes ──
	pagesHandler := pages.NewHandler(db)
	pagesGroup := api.Group("/pages", middleware.AuthMiddleware(jwtManager, redis), apiRateLimit)
	pagesGroup.Post("/connect", pagesHandler.ConnectPage)
	pagesGroup.Get("", pagesHandler.ListPages)
	pagesGroup.Delete("/:id", pagesHandler.DisconnectPage)
	pagesGroup.Post("/publish", pagesHandler.PublishPost)

	// ── Product Routes ──
	productsHandler := products.NewHandler(db, spacesClient)
	productsGroup := api.Group("/products", middleware.AuthMiddleware(jwtManager, redis), apiRateLimit)
	productsGroup.Post("/upload", productsHandler.UploadImage)
	productsGroup.Post("", productsHandler.CreateProduct)
	productsGroup.Get("", productsHandler.ListProducts)
	productsGroup.Get("/:id", productsHandler.GetProduct)
	productsGroup.Put("/:id", productsHandler.UpdateProduct)
	productsGroup.Delete("/:id", productsHandler.DeleteProduct)

	// ── Order Routes ──
	ordersHandler := orders.NewHandler(db)
	ordersGroup := api.Group("/orders", middleware.AuthMiddleware(jwtManager, redis), apiRateLimit)
	ordersGroup.Get("", ordersHandler.ListOrders)
	ordersGroup.Get("/stats", ordersHandler.GetOrderStats)
	ordersGroup.Get("/:id", ordersHandler.GetOrder)
	ordersGroup.Post("", ordersHandler.CreateOrder)
	ordersGroup.Put("/:id", ordersHandler.UpdateOrder)

	// ── Conversation Routes ──
	convHandler := conversations.NewHandler(db)
	convGroup := api.Group("/conversations", middleware.AuthMiddleware(jwtManager, redis), apiRateLimit)
	convGroup.Get("", convHandler.ListConversations)
	convGroup.Get("/stats", convHandler.GetConversationStats)
	convGroup.Get("/:id/messages", convHandler.GetMessages)
	convGroup.Post("/:id/messages", convHandler.SendMessage)
	convGroup.Put("/:id/mode", convHandler.UpdateMode)

	// ── Billing Routes ──
	billingHandler := billing.NewHandler(db, redis, cfg, wsHub)
	billingGroup := api.Group("/billing")

	billingGroup.Get("/plans", billingHandler.GetPlans)
	// Webhook routes (no auth — called by payment gateways)
	billingGroup.Post("/webhook/sslcommerz/success", billingHandler.WebhookSSLCommerzSuccess)
	billingGroup.Post("/webhook/sslcommerz/fail", billingHandler.WebhookSSLCommerzFail)

	billingProtected := billingGroup.Group("", middleware.AuthMiddleware(jwtManager, redis), apiRateLimit)
	billingProtected.Get("/subscription", billingHandler.GetSubscription)
	billingProtected.Post("/subscribe/sslcommerz", billingHandler.SubscribeSSLCommerz)
	billingProtected.Get("/payments", billingHandler.GetPayments)
	billingProtected.Post("/cancel", billingHandler.CancelSubscription)

	// ── Agent Routes ──
	agentGroup := api.Group("/agents", middleware.AuthMiddleware(jwtManager, redis), apiRateLimit)
	agentGroup.Post("/:slug/run", agentHandler.RunAgent)
	agentGroup.Get("/:slug/tasks", agentHandler.GetTasks)
	agentGroup.Get("/:slug/tasks/:taskId", agentHandler.GetTask)
	agentGroup.Delete("/:slug/tasks/:taskId", agentHandler.DeleteTask)

	// ── Admin Routes ──
	adminHandler := admin.NewHandler(db)
	adminGroup := api.Group("/admin",
		middleware.AuthMiddleware(jwtManager, redis),
		middleware.RBACMiddleware(models.RoleSuperAdmin),
	)
	adminGroup.Get("/users", adminHandler.ListUsers)
	adminGroup.Put("/users/:id/status", adminHandler.UpdateUserStatus)
	adminGroup.Put("/users/:id/role", adminHandler.UpdateUserRole)
	adminGroup.Post("/users/:id/grant-plan", adminHandler.GrantSubscription)
	adminGroup.Get("/tasks", adminHandler.ListAllTasks)
	adminGroup.Get("/metrics", adminHandler.GetMetrics)

	// ── Bootstrap Admin (only works if no super_admin exists) ──
	api.Post("/admin/bootstrap", middleware.AuthMiddleware(jwtManager, redis), func(c *fiber.Ctx) error {
		var count int64
		db.Model(&models.User{}).Where("role = ?", "super_admin").Count(&count)
		if count > 0 {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Super admin already exists"})
		}
		userID := c.Locals("user_id").(string)
		db.Model(&models.User{}).Where("id = ?", userID).Update("role", "super_admin")
		return c.JSON(fiber.Map{"success": true, "message": "You are now super_admin"})
	})

	// ── WebSocket ──
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws", websocket.New(func(conn *websocket.Conn) {
		token := conn.Query("token")
		if token == "" {
			conn.Close()
			return
		}

		claims, err := jwtManager.ValidateAccessToken(token)
		if err != nil {
			conn.Close()
			return
		}

		wsHub.Register(claims.UserID, conn)
		defer wsHub.Unregister(claims.UserID)

		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}))
}
