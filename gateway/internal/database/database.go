package database

import (
	"log/slog"

	"github.com/xeni-ai/gateway/internal/config"
	"github.com/xeni-ai/gateway/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect establishes a connection to PostgreSQL and runs auto-migrations.
func Connect(cfg *config.DBConfig, env string) (*gorm.DB, error) {
	logLevel := logger.Info
	if env == "production" {
		logLevel = logger.Warn
	}

	db, err := gorm.Open(postgres.Open(cfg.URI), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	slog.Info("connected to PostgreSQL")

	// Auto-migrate in development (schema is managed via init.sql in production)
	// Auto-migrate always to ensure schema synchronization
	if err := autoMigrate(db); err != nil {
		slog.Warn("auto-migration threw a warning, check schema state", "error", err)
	}

	// Seed default data
	Seed(db)

	return db, nil
}

func autoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		&models.OTPCode{},
		&models.Shop{},
		&models.ConnectedPage{},
		&models.Product{},
		&models.Order{},
		&models.Conversation{},
		&models.Message{},
		&models.Plan{},
		&models.Subscription{},
		&models.Payment{},
		&models.AgentTask{},
		&models.AuditLog{},
		// Admin dashboard tables
		&models.ContentSection{},
		&models.Review{},
		&models.ReviewSettings{},
		&models.PlatformMetricsCache{},
	)
}

// Seed inserts default data if tables are empty.
func Seed(db *gorm.DB) {
	// Seed Plans
	var planCount int64
	db.Model(&models.Plan{}).Count(&planCount)
	if planCount == 0 {
		slog.Info("seeding default plans...")
		plans := []models.Plan{
			{
				Name: "Starter", Tier: models.TierStarter, PriceMonthlyBDT: 1000, IsActive: true, DisplayOrder: 1,
				CTAText: "Start Free", Features: models.JSON(`["💬 Conversation Agent", "200 orders/month", "1 Facebook Page", "2 GB storage", "Email support"]`),
			},
			{
				Name: "Professional", Tier: models.TierProfessional, PriceMonthlyBDT: 2500, IsActive: true, IsMostPopular: true, DisplayOrder: 2,
				CTAText: "Get Pro", Features: models.JSON(`["💬 Conversation Agent", "📦 Order Processing Agent", "📊 Inventory Agent", "1,000 orders/month", "3 Facebook Pages", "10 GB storage", "Priority support"]`),
			},
			{
				Name: "Premium", Tier: models.TierPremium, PriceMonthlyBDT: 5000, IsActive: true, DisplayOrder: 3,
				CTAText: "Get Premium", Features: models.JSON(`["All 5 AI Agents", "Unlimited orders", "10 Facebook Pages", "50 GB storage", "🎨 AI Image Generation", "🧠 Sales Intelligence", "Dedicated support"]`),
			},
			{
				Name: "Enterprise", Tier: models.TierEnterprise, PriceMonthlyBDT: 0, IsActive: true, DisplayOrder: 4,
				CTAText: "Contact Sales", Features: models.JSON(`["All 5 AI Agents", "White-label branding", "Custom API access", "ERP Integration", "SLA guarantee", "Dedicated account manager"]`),
			},
		}
		for _, p := range plans {
			db.Create(&p)
		}
	}

	// Seed Content Sections
	headers := []string{"hero", "banner", "faq"}
	for _, key := range headers {
		var count int64
		db.Model(&models.ContentSection{}).Where("section_key = ?", key).Count(&count)
		if count == 0 {
			slog.Info("seeding content section", "key", key)
			section := models.ContentSection{
				SectionKey: key,
				ContentEN:  models.JSON(`{"items":[],"headline":"","subheadline":"","text":""}`),
				ContentBN:  models.JSON(`{"items":[],"headline":"","subheadline":"","text":""}`),
			}
			if key == "hero" {
				section.ContentEN = models.JSON(`{"headline":"I'm XENI | Your | Smart Assistant","subheadline":"Scale Your F-commerce Smartly","cta_text":"Start Free"}`)
				section.ContentBN = models.JSON(`{"headline":"আমি জেনি (XENI) | আপনার | স্মার্ট অ্যাসিস্ট্যান্ট","subheadline":"আপনার এফ-কমার্স ব্যবসা স্মার্টলি স্কেল করুন","cta_text":"শুরু করুন"}`)
			}
			if key == "banner" {
				section.ContentEN = models.JSON(`{"text":"Welcome to Xeni AI!","link":"","is_active":false,"color":"#7C3AED"}`)
				section.ContentBN = models.JSON(`{"text":"জেনি এআই-তে স্বাগতম!","link":"","is_active":false,"color":"#7C3AED"}`)
			}
			db.Create(&section)
		}
	}

	// Seed Review Settings
	var settingCount int64
	db.Model(&models.ReviewSettings{}).Count(&settingCount)
	if settingCount == 0 {
		db.Create(&models.ReviewSettings{
			ShowStarRating: true,
			MinStarToShow:  4,
			MaxReviewsOnLanding: 6,
		})
	}
}
