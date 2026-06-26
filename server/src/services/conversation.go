package services

import (
	"context"
	"strings"
	"time"

	"github.com/skygenesisenterprise/aether-meet/server/src/interfaces"
	"github.com/skygenesisenterprise/aether-meet/server/src/models"
	"github.com/skygenesisenterprise/aether-meet/server/src/utils"
)

type ConversationService struct {
	conversations interfaces.ConversationRepository
	members       interfaces.ConversationMemberRepository
	workspaces    *WorkspaceService
}

func NewConversationService(conversations interfaces.ConversationRepository, members interfaces.ConversationMemberRepository, workspaces *WorkspaceService) *ConversationService {
	return &ConversationService{conversations: conversations, members: members, workspaces: workspaces}
}

func (s *ConversationService) List(ctx context.Context, principal interfaces.Principal, workspaceID string) ([]models.Conversation, error) {
	if _, err := s.workspaces.AuthorizeWorkspace(ctx, principal, workspaceID); err != nil {
		return nil, err
	}
	return s.conversations.ListByWorkspace(ctx, workspaceID)
}

func (s *ConversationService) Create(ctx context.Context, principal interfaces.Principal, workspaceID, conversationType, name string, memberIDs []string) (*models.Conversation, error) {
	if _, err := s.workspaces.AuthorizeWorkspace(ctx, principal, workspaceID); err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	item := &models.Conversation{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspaceID, Type: conversationType, Name: strings.TrimSpace(name), CreatedBy: principal.UserID,
	}
	if err := s.conversations.Create(ctx, item); err != nil {
		return nil, err
	}
	if conversationType != "channel" {
		allMembers := append([]string{principal.UserID}, memberIDs...)
		seen := map[string]struct{}{}
		for _, userID := range allMembers {
			if _, ok := seen[userID]; ok || userID == "" {
				continue
			}
			seen[userID] = struct{}{}
			member := &models.ConversationMember{
				Common:         models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
				ConversationID: item.ID, UserID: userID, Role: "member", JoinedAt: now,
			}
			if err := s.members.Create(ctx, member); err != nil {
				return nil, err
			}
		}
	}
	return item, nil
}

func (s *ConversationService) Get(ctx context.Context, principal interfaces.Principal, conversationID string) (*models.Conversation, error) {
	item, err := s.conversations.GetByID(ctx, conversationID)
	if err != nil {
		return nil, err
	}
	if _, err := s.workspaces.AuthorizeWorkspace(ctx, principal, item.WorkspaceID); err != nil {
		return nil, err
	}
	if item.Type != "channel" {
		if _, err := s.members.Get(ctx, conversationID, principal.UserID); err != nil {
			return nil, err
		}
	}
	return item, nil
}

func (s *ConversationService) Update(ctx context.Context, principal interfaces.Principal, conversationID, name string) (*models.Conversation, error) {
	item, err := s.Get(ctx, principal, conversationID)
	if err != nil {
		return nil, err
	}
	item.Name = strings.TrimSpace(name)
	item.UpdatedAt = time.Now().UTC()
	return item, s.conversations.Update(ctx, item)
}

func (s *ConversationService) Delete(ctx context.Context, principal interfaces.Principal, conversationID string) error {
	item, err := s.Get(ctx, principal, conversationID)
	if err != nil {
		return err
	}
	return s.conversations.Archive(ctx, item.ID, time.Now().UTC())
}
