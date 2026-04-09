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
	modelsToMigrate := []interface{}{
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
		// Rules Engine
		&models.SystemSetting{},
		&models.AgentRule{},
	}

	for _, m := range modelsToMigrate {
		if err := db.AutoMigrate(m); err != nil {
			slog.Error("failed to migrate model", "error", err)
			// Continue to next model regardless of failure
		}
	}
	return nil
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
	headers := []string{"hero", "banner", "faq", "pricing_settings"}
	for _, key := range headers {
		var count int64
		db.Model(&models.ContentSection{}).Where("section_key = ?", key).Count(&count)
		if count == 0 {
			slog.Info("seeding content section", "key", key)
			section := models.ContentSection{
				SectionKey: key,
				ContentEN:  models.JSON(`{}`),
				ContentBN:  models.JSON(`{}`),
			}
			
			switch key {
			case "hero":
				section.ContentEN = models.JSON(`{"headline":"Your Online Shop AI Employee","subheadline":"Automate conversations, orders, and content 24/7","cta_text":"Start Free","badge_text":"Now with AI Image Generation"}`)
				section.ContentBN = models.JSON(`{"headline":"আপনার অনলাইন শপের AI কর্মী","subheadline":"কথোপকথন, অর্ডার এবং কন্টেন্ট ২৪/৭ স্বয়ংক্রিয় করুন","cta_text":"বিনামূল্যে শুরু করুন","badge_text":"এখন AI ইমেজ জেনারেশনসহ"}`)
			case "banner":
				section.ContentEN = models.JSON(`{"text":"Welcome to Xeni AI!","color":"violet","link":"","is_active":false}`)
				section.ContentBN = models.JSON(`{"text":"জেনি এআই-তে স্বাগতম!","link":"","is_active":false}`)
			case "faq":
				section.ContentEN = models.JSON(`{"items":[]}`)
				section.ContentBN = models.JSON(`{"items":[]}`)
			case "pricing_settings":
				section.ContentEN = models.JSON(`{"show_most_popular":true,"most_popular_plan_id":""}`)
				section.ContentBN = models.JSON(`{}`)
			}
			db.Create(&section)
		}
	}

	// Seed Review Settings
	var reviewSettingCount int64
	db.Model(&models.ReviewSettings{}).Count(&reviewSettingCount)
	if reviewSettingCount == 0 {
		db.Create(&models.ReviewSettings{
			ID:                  1,
			AutoApprovePremium:  false,
			ShowStarRating:      true,
			MinStarToShow:       4,
			MaxReviewsOnLanding: 6,
		})
	}

	// Seed default Global Agent Rules (legacy text)
	var systemSettingCount int64
	db.Model(&models.SystemSetting{}).Where("setting_key = 'global_agent_rules'").Count(&systemSettingCount)
	if systemSettingCount == 0 {
		slog.Info("seeding default global_agent_rules...")
		defaultRules := "1. If the customer has already provided their Delivery Address and Phone Number, do NOT ask for it again. Instead, politely confirm the order and tell them it will be processed shortly.\n2. Be respectful and use proper greetings.\n3. Always reply in the same language the customer uses (Bangla or English)."
		description := "Global Master Prompt for all AI workers across the platform"
		db.Create(&models.SystemSetting{
			SettingKey:   "global_agent_rules",
			SettingValue: &defaultRules,
			Description:  &description,
		})
	}

	// Seed default Global Agent Rules (structured)
	var agentRuleCount int64
	if err := db.Model(&models.AgentRule{}).Where("scope = 'global'").Count(&agentRuleCount).Error; err == nil {
		if agentRuleCount == 0 {
			slog.Info("seeding default global agent rules...")
			defaultRules := models.DefaultGlobalRules()
			for _, rule := range defaultRules {
				db.Create(&rule)
			}
			slog.Info("seeded global agent rules", "count", len(defaultRules))
		}
	} else {
		slog.Warn("could not check agent rules count, skipping seed", "error", err)
	}
}
