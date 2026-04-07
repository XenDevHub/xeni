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
			{Name: "Starter", Tier: models.TierStarter, PriceMonthlyBDT: 1000, IsActive: true, CTAText: "Start Free", Features: models.JSON(`["💬 Conversation Agent", "200 orders/month", "1 Facebook Page", "2 GB storage"]`)},
			{Name: "Professional", Tier: models.TierProfessional, PriceMonthlyBDT: 2500, IsActive: true, IsMostPopular: true, CTAText: "Get Pro", Features: models.JSON(`["💬 Conversation Agent", "📦 Order Processing Agent", "📊 Inventory Agent", "1,000 orders/month"]`)},
			{Name: "Premium", Tier: models.TierPremium, PriceMonthlyBDT: 5000, IsActive: true, CTAText: "Get Premium", Features: models.JSON(`["All 5 AI Agents", "Unlimited orders", "10 Facebook Pages", "🎨 AI Image Generation"]`)},
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
				ContentEN:  models.JSON(`{"items":[]}`),
				ContentBN:  models.JSON(`{"items":[]}`),
			}
			if key == "hero" {
				section.ContentEN = models.JSON(`{"headline":"Your Online Shop AI Employee","subheadline":"Automate conversations, orders, and content 24/7","cta_text":"Start Free"}`)
				section.ContentBN = models.JSON(`{"headline":"আপনার অনলাইন শপের AI কর্মী","subheadline":"কথোপকথন, অর্ডার এবং কন্টেন্ট ২৪/৭ স্বয়ংক্রিয় করুন","cta_text":"শুরু করুন"}`)
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
