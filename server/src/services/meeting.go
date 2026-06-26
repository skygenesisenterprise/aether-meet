package services

import (
	"context"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/skygenesisenterprise/aether-meet/server/src/config"
	"github.com/skygenesisenterprise/aether-meet/server/src/interfaces"
	"github.com/skygenesisenterprise/aether-meet/server/src/models"
	"github.com/skygenesisenterprise/aether-meet/server/src/utils"
)

type DisabledMeetingProvider struct{}

func (p *DisabledMeetingProvider) CreateRoom(context.Context, models.Meeting) (*interfaces.ProviderRoom, error) {
	return nil, utils.ErrMeetingProviderUnavailable
}
func (p *DisabledMeetingProvider) CreateJoinToken(context.Context, models.Meeting, interfaces.Principal) (string, error) {
	return "", utils.ErrMeetingProviderUnavailable
}
func (p *DisabledMeetingProvider) EndRoom(context.Context, models.Meeting) error {
	return utils.ErrMeetingProviderUnavailable
}

type LiveKitMeetingProvider struct {
	cfg config.LiveKitConfig
}

func (p *LiveKitMeetingProvider) CreateRoom(_ context.Context, meeting models.Meeting) (*interfaces.ProviderRoom, error) {
	return &interfaces.ProviderRoom{ID: meeting.ID, URL: p.cfg.URL}, nil
}
func (p *LiveKitMeetingProvider) CreateJoinToken(_ context.Context, meeting models.Meeting, principal interfaces.Principal) (string, error) {
	now := time.Now().UTC()
	claims := jwt.MapClaims{
		"iss": p.cfg.APIKey,
		"sub": principal.UserID,
		"nbf": now.Unix(),
		"exp": now.Add(1 * time.Hour).Unix(),
		"video": map[string]any{
			"room":         meeting.ID,
			"roomJoin":     true,
			"canPublish":   true,
			"canSubscribe": true,
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(p.cfg.APISecret))
}
func (p *LiveKitMeetingProvider) EndRoom(context.Context, models.Meeting) error { return nil }

func NewMeetingProvider(cfg config.LiveKitConfig) interfaces.MeetingProvider {
	if !cfg.Enabled {
		return &DisabledMeetingProvider{}
	}
	return &LiveKitMeetingProvider{cfg: cfg}
}

type MeetingService struct {
	meetings   interfaces.MeetingRepository
	workspaces *WorkspaceService
	provider   interfaces.MeetingProvider
}

func NewMeetingService(meetings interfaces.MeetingRepository, workspaces *WorkspaceService, provider interfaces.MeetingProvider) *MeetingService {
	return &MeetingService{meetings: meetings, workspaces: workspaces, provider: provider}
}

func (s *MeetingService) List(ctx context.Context, principal interfaces.Principal, workspaceID string) ([]models.Meeting, error) {
	if _, err := s.workspaces.AuthorizeWorkspace(ctx, principal, workspaceID); err != nil {
		return nil, err
	}
	return s.meetings.ListByWorkspace(ctx, workspaceID)
}

func (s *MeetingService) Create(ctx context.Context, principal interfaces.Principal, workspaceID, title string, conversationID *string) (*models.Meeting, error) {
	if _, err := s.workspaces.AuthorizeWorkspace(ctx, principal, workspaceID); err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	meeting := &models.Meeting{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspaceID, ConversationID: conversationID, Provider: "livekit", Title: title, Status: "scheduled", CreatedBy: principal.UserID,
	}
	if err := s.meetings.Create(ctx, meeting); err != nil {
		return nil, err
	}
	return meeting, nil
}

func (s *MeetingService) Get(ctx context.Context, principal interfaces.Principal, meetingID string) (*models.Meeting, error) {
	meeting, err := s.meetings.GetByID(ctx, meetingID)
	if err != nil {
		return nil, err
	}
	if _, err := s.workspaces.AuthorizeWorkspace(ctx, principal, meeting.WorkspaceID); err != nil {
		return nil, err
	}
	return meeting, nil
}

func (s *MeetingService) Start(ctx context.Context, principal interfaces.Principal, meetingID string) (*models.Meeting, error) {
	meeting, err := s.Get(ctx, principal, meetingID)
	if err != nil {
		return nil, err
	}
	room, err := s.provider.CreateRoom(ctx, *meeting)
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	meeting.Status = "active"
	meeting.ProviderRoomID = room.ID
	meeting.StartedAt = &now
	meeting.UpdatedAt = now
	return meeting, s.meetings.Update(ctx, meeting)
}

func (s *MeetingService) End(ctx context.Context, principal interfaces.Principal, meetingID string) (*models.Meeting, error) {
	meeting, err := s.Get(ctx, principal, meetingID)
	if err != nil {
		return nil, err
	}
	if err := s.provider.EndRoom(ctx, *meeting); err != nil && err != utils.ErrMeetingProviderUnavailable {
		return nil, err
	}
	now := time.Now().UTC()
	meeting.Status = "ended"
	meeting.EndedAt = &now
	meeting.UpdatedAt = now
	return meeting, s.meetings.Update(ctx, meeting)
}

func (s *MeetingService) JoinToken(ctx context.Context, principal interfaces.Principal, meetingID string) (string, error) {
	meeting, err := s.Get(ctx, principal, meetingID)
	if err != nil {
		return "", err
	}
	return s.provider.CreateJoinToken(ctx, *meeting, principal)
}
