package services

import (
	"context"

	"github.com/skygenesisenterprise/aether-meet/server/src/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DatabaseService struct {
	db *gorm.DB
}

func NewDatabaseService(dsn string) (*DatabaseService, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return &DatabaseService{db: db}, nil
}

func (s *DatabaseService) Gorm() *gorm.DB {
	return s.db
}

func (s *DatabaseService) Ping(ctx context.Context) error {
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.PingContext(ctx)
}

func (s *DatabaseService) Close() error {
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

func (s *DatabaseService) Transaction(ctx context.Context, fn func(tx *gorm.DB) error) error {
	return s.db.WithContext(ctx).Transaction(fn)
}

func (s *DatabaseService) AutoMigrate() error {
	return s.db.AutoMigrate(
		&models.User{},
		&models.Workspace{},
		&models.WorkspaceMember{},
		&models.Team{},
		&models.Channel{},
		&models.Conversation{},
		&models.ConversationMember{},
		&models.Message{},
		&models.Reaction{},
		&models.ReadReceipt{},
		&models.Meeting{},
		&models.MeetingParticipant{},
		&models.Integration{},
		&models.AuditLog{},
		&models.Notification{},
		&models.OutboxEvent{},
		&models.Attachment{},
	)
}
