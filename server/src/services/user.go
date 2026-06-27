package services

import (
	"context"
	"strings"
	"time"

	"github.com/skygenesisenterprise/aether-meet/server/src/interfaces"
	"github.com/skygenesisenterprise/aether-meet/server/src/models"
	"github.com/skygenesisenterprise/aether-meet/server/src/utils"
)

type UserService struct {
	users interfaces.UserRepository
}

func NewUserService(users interfaces.UserRepository) *UserService {
	return &UserService{users: users}
}

func (s *UserService) EnsureUser(ctx context.Context, principal interfaces.Principal) (*models.User, error) {
	user, err := s.users.GetByID(ctx, principal.UserID)
	if err == nil {
		return user, nil
	}
	user = &models.User{
		Common:          models.Common{ID: principal.UserID, CreatedAt: time.Now().UTC(), UpdatedAt: time.Now().UTC()},
		Email:           principal.UserID + "@local.aether",
		EmailNormalized: principal.UserID + "@local.aether",
		DisplayName:     principal.UserID,
		Status:          "active",
		PresenceStatus:  "online",
	}
	if createErr := s.users.Create(ctx, user); createErr != nil {
		return nil, createErr
	}
	return user, nil
}

func (s *UserService) GetMe(ctx context.Context, principal interfaces.Principal) (*models.User, error) {
	return s.EnsureUser(ctx, principal)
}

func (s *UserService) UpdateMe(ctx context.Context, principal interfaces.Principal, displayName, avatarURL, status string) (*models.User, error) {
	user, err := s.EnsureUser(ctx, principal)
	if err != nil {
		return nil, err
	}
	if displayName != "" {
		user.DisplayName = strings.TrimSpace(displayName)
	}
	if trimmed := strings.TrimSpace(avatarURL); trimmed != "" {
		user.AvatarURL = &trimmed
	} else {
		user.AvatarURL = nil
	}
	if status != "" {
		user.PresenceStatus = status
	}
	user.UpdatedAt = time.Now().UTC()
	if err := s.users.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func roleAllowed(role string) bool {
	return utils.ValidRole(role)
}
