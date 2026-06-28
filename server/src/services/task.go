package services

import (
	"context"
	"time"

	"github.com/skygenesisenterprise/aether-meet/server/src/interfaces"
	"github.com/skygenesisenterprise/aether-meet/server/src/models"
)

type TaskDTO struct {
	ID              string     `json:"id"`
	WorkspaceID     string     `json:"workspaceId"`
	Title           string     `json:"title"`
	Description     string     `json:"description,omitempty"`
	Status          string     `json:"status"`
	Priority        string     `json:"priority"`
	Project         string     `json:"project,omitempty"`
	AssigneeUserID  *string    `json:"assigneeUserId,omitempty"`
	AssigneeName    string     `json:"assigneeName,omitempty"`
	CreatedBy       string     `json:"createdBy"`
	DueAt           *time.Time `json:"dueAt,omitempty"`
	CompletedAt     *time.Time `json:"completedAt,omitempty"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

type TaskService struct {
	tasks      interfaces.TaskRepository
	users      interfaces.UserRepository
	workspaces *WorkspaceService
}

func NewTaskService(tasks interfaces.TaskRepository, users interfaces.UserRepository, workspaces *WorkspaceService) *TaskService {
	return &TaskService{tasks: tasks, users: users, workspaces: workspaces}
}

func (s *TaskService) List(ctx context.Context, principal interfaces.Principal, workspaceID string) ([]TaskDTO, error) {
	if _, err := s.workspaces.AuthorizeWorkspace(ctx, principal, workspaceID); err != nil {
		return nil, err
	}
	items, err := s.tasks.ListByWorkspace(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	result := make([]TaskDTO, 0, len(items))
	for _, item := range items {
		result = append(result, s.toTaskDTO(ctx, item))
	}
	return result, nil
}

func (s *TaskService) toTaskDTO(ctx context.Context, item models.Task) TaskDTO {
	assigneeName := ""
	if item.AssigneeUserID != nil && *item.AssigneeUserID != "" {
		user, err := s.users.GetByID(ctx, *item.AssigneeUserID)
		if err == nil {
			assigneeName = user.DisplayName
		}
	}
	return TaskDTO{
		ID:             item.ID,
		WorkspaceID:    item.WorkspaceID,
		Title:          item.Title,
		Description:    item.Description,
		Status:         item.Status,
		Priority:       item.Priority,
		Project:        item.Project,
		AssigneeUserID: item.AssigneeUserID,
		AssigneeName:   assigneeName,
		CreatedBy:      item.CreatedBy,
		DueAt:          item.DueAt,
		CompletedAt:    item.CompletedAt,
		CreatedAt:      item.CreatedAt,
		UpdatedAt:      item.UpdatedAt,
	}
}

