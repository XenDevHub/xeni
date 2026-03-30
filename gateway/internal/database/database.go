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
	if env != "production" {
		if err := autoMigrate(db); err != nil {
			slog.Warn("auto-migration skipped (tables likely created by init.sql)", "error", err)
		}
	}

	return db, nil
}

func autoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		&models.OTPCode{},
		&models.Plan{},
		&models.Subscription{},
		&models.Payment{},
		&models.AgentTask{},
		&models.AuditLog{},
	)
}
