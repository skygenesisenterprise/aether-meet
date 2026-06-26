package services

import (
	"context"
	"strings"
	"time"

	"github.com/skygenesisenterprise/aether-meet/server/src/interfaces"
	"github.com/skygenesisenterprise/aether-meet/server/src/models"
	"github.com/skygenesisenterprise/aether-meet/server/src/utils"
	"gorm.io/gorm"
)

type WorkspaceService struct {
	db     interfaces.Database
	users  interfaces.UserRepository
	repos  *Repositories
	audits interfaces.AuditLogRepository
}

func NewWorkspaceService(db interfaces.Database, users interfaces.UserRepository, repos *Repositories, audits interfaces.AuditLogRepository) *WorkspaceService {
	return &WorkspaceService{db: db, users: users, repos: repos, audits: audits}
}

func (s *WorkspaceService) List(ctx context.Context, principal interfaces.Principal) ([]models.Workspace, error) {
	return s.repos.Workspaces().ListByUser(ctx, principal.UserID)
}

func (s *WorkspaceService) Get(ctx context.Context, principal interfaces.Principal, workspaceID string) (*models.Workspace, error) {
	if _, err := s.AuthorizeWorkspace(ctx, principal, workspaceID); err != nil {
		return nil, err
	}
	return s.repos.Workspaces().GetByID(ctx, workspaceID)
}

func (s *WorkspaceService) Create(ctx context.Context, principal interfaces.Principal, name, slug, description string) (*models.Workspace, error) {
	if !utils.ValidWorkspaceSlug(slug) {
		return nil, utils.NewError(400, "VALIDATION_FAILED", "Workspace slug is invalid.", map[string]any{"field": "slug"})
	}
	now := time.Now().UTC()
	workspace := &models.Workspace{
		Common: models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		Name:   strings.TrimSpace(name), Slug: strings.TrimSpace(slug), Description: strings.TrimSpace(description),
		Visibility: "private", OwnerID: principal.UserID,
	}
	member := &models.WorkspaceMember{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspace.ID, UserID: principal.UserID, Role: "owner", JoinedAt: now,
	}
	if err := s.db.Transaction(ctx, func(tx *gorm.DB) error {
		txRepos := s.repos.WithDB(tx)
		if err := txRepos.Workspaces().Create(ctx, workspace); err != nil {
			return err
		}
		return txRepos.WorkspaceMembers().Create(ctx, member)
	}); err != nil {
		return nil, err
	}
	return workspace, nil
}

func (s *WorkspaceService) Update(ctx context.Context, principal interfaces.Principal, workspaceID, name, description string) (*models.Workspace, error) {
	member, err := s.AuthorizeWorkspace(ctx, principal, workspaceID)
	if err != nil {
		return nil, err
	}
	if !isAdminRole(member.Role) {
		return nil, utils.ErrForbidden
	}
	workspace, err := s.repos.Workspaces().GetByID(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	if name != "" {
		workspace.Name = strings.TrimSpace(name)
	}
	workspace.Description = strings.TrimSpace(description)
	workspace.UpdatedAt = time.Now().UTC()
	return workspace, s.repos.Workspaces().Update(ctx, workspace)
}

func (s *WorkspaceService) Archive(ctx context.Context, principal interfaces.Principal, workspaceID string) error {
	member, err := s.AuthorizeWorkspace(ctx, principal, workspaceID)
	if err != nil {
		return err
	}
	if member.Role != "owner" {
		return utils.ErrForbidden
	}
	return s.repos.Workspaces().Archive(ctx, workspaceID, time.Now().UTC())
}

func (s *WorkspaceService) ListMembers(ctx context.Context, principal interfaces.Principal, workspaceID string) ([]models.WorkspaceMember, error) {
	if _, err := s.AuthorizeWorkspace(ctx, principal, workspaceID); err != nil {
		return nil, err
	}
	return s.repos.WorkspaceMembers().ListByWorkspace(ctx, workspaceID)
}

func (s *WorkspaceService) AddMember(ctx context.Context, principal interfaces.Principal, workspaceID, userID, role string) (*models.WorkspaceMember, error) {
	member, err := s.AuthorizeWorkspace(ctx, principal, workspaceID)
	if err != nil {
		return nil, err
	}
	if !isAdminRole(member.Role) || !roleAllowed(role) {
		return nil, utils.ErrForbidden
	}
	if _, err := s.users.GetByID(ctx, userID); err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	item := &models.WorkspaceMember{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspaceID, UserID: userID, Role: role, JoinedAt: now,
	}
	return item, s.repos.WorkspaceMembers().Create(ctx, item)
}

func (s *WorkspaceService) UpdateMember(ctx context.Context, principal interfaces.Principal, workspaceID, userID, role string) (*models.WorkspaceMember, error) {
	member, err := s.AuthorizeWorkspace(ctx, principal, workspaceID)
	if err != nil {
		return nil, err
	}
	if !isAdminRole(member.Role) {
		return nil, utils.ErrForbidden
	}
	target, err := s.repos.WorkspaceMembers().Get(ctx, workspaceID, userID)
	if err != nil {
		return nil, err
	}
	target.Role = role
	target.UpdatedAt = time.Now().UTC()
	return target, s.repos.WorkspaceMembers().Update(ctx, target)
}

func (s *WorkspaceService) RemoveMember(ctx context.Context, principal interfaces.Principal, workspaceID, userID string) error {
	member, err := s.AuthorizeWorkspace(ctx, principal, workspaceID)
	if err != nil {
		return err
	}
	if !isAdminRole(member.Role) {
		return utils.ErrForbidden
	}
	return s.repos.WorkspaceMembers().Delete(ctx, workspaceID, userID)
}

func (s *WorkspaceService) AuthorizeWorkspace(ctx context.Context, principal interfaces.Principal, workspaceID string) (*models.WorkspaceMember, error) {
	member, err := s.repos.WorkspaceMembers().Get(ctx, workspaceID, principal.UserID)
	if err != nil {
		return nil, err
	}
	return member, nil
}

func isAdminRole(role string) bool {
	return role == "owner" || role == "admin"
}
