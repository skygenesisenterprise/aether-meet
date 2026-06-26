package services

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/skygenesisenterprise/aether-meet/server/src/interfaces"
	"github.com/skygenesisenterprise/aether-meet/server/src/models"
	"github.com/skygenesisenterprise/aether-meet/server/src/utils"
)

type GenericWebhookProvider struct{}

func (p *GenericWebhookProvider) Name() string { return "webhook" }
func (p *GenericWebhookProvider) ValidateConfiguration(_ context.Context, _ map[string]any) error {
	return nil
}
func (p *GenericWebhookProvider) HandleWebhook(_ context.Context, integration models.Integration, payload []byte, _ http.Header) ([]interfaces.Event, error) {
	var data map[string]any
	if len(payload) > 0 {
		_ = json.Unmarshal(payload, &data)
	}
	return []interfaces.Event{{
		ID:          utils.NewID(),
		Topic:       "workspace." + integration.WorkspaceID,
		Type:        "integration.event",
		WorkspaceID: integration.WorkspaceID,
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Payload: map[string]any{
			"integrationId": integration.ID,
			"provider":      integration.Provider,
			"payload":       data,
		},
	}}, nil
}

type IntegrationService struct {
	integrations interfaces.IntegrationRepository
	workspaces   *WorkspaceService
	bus          interfaces.EventBus
	providers    map[string]interfaces.IntegrationProvider
}

func NewIntegrationService(integrations interfaces.IntegrationRepository, workspaces *WorkspaceService, bus interfaces.EventBus) *IntegrationService {
	return &IntegrationService{
		integrations: integrations,
		workspaces:   workspaces,
		bus:          bus,
		providers: map[string]interfaces.IntegrationProvider{
			"webhook": &GenericWebhookProvider{},
		},
	}
}

func (s *IntegrationService) List(ctx context.Context, principal interfaces.Principal, workspaceID string) ([]models.Integration, error) {
	if _, err := s.workspaces.AuthorizeWorkspace(ctx, principal, workspaceID); err != nil {
		return nil, err
	}
	return s.integrations.ListByWorkspace(ctx, workspaceID)
}

func (s *IntegrationService) Create(ctx context.Context, principal interfaces.Principal, workspaceID, provider, name string, config map[string]any) (*models.Integration, error) {
	member, err := s.workspaces.AuthorizeWorkspace(ctx, principal, workspaceID)
	if err != nil {
		return nil, err
	}
	if !isAdminRole(member.Role) || !utils.ValidProvider(provider) {
		return nil, utils.ErrForbidden
	}
	cfgBytes, _ := json.Marshal(config)
	now := time.Now().UTC()
	item := &models.Integration{
		Common:      models.Common{ID: utils.NewID(), CreatedAt: now, UpdatedAt: now},
		WorkspaceID: workspaceID, Provider: provider, Name: strings.TrimSpace(name),
		Status: "active", Configuration: cfgBytes, CreatedBy: principal.UserID,
	}
	return item, s.integrations.Create(ctx, item)
}

func (s *IntegrationService) Get(ctx context.Context, principal interfaces.Principal, id string) (*models.Integration, error) {
	item, err := s.integrations.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if _, err := s.workspaces.AuthorizeWorkspace(ctx, principal, item.WorkspaceID); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *IntegrationService) Update(ctx context.Context, principal interfaces.Principal, id, name, status string) (*models.Integration, error) {
	item, err := s.Get(ctx, principal, id)
	if err != nil {
		return nil, err
	}
	item.Name = strings.TrimSpace(name)
	if status != "" {
		item.Status = status
	}
	item.UpdatedAt = time.Now().UTC()
	return item, s.integrations.Update(ctx, item)
}

func (s *IntegrationService) Delete(ctx context.Context, principal interfaces.Principal, id string) error {
	item, err := s.Get(ctx, principal, id)
	if err != nil {
		return err
	}
	member, err := s.workspaces.AuthorizeWorkspace(ctx, principal, item.WorkspaceID)
	if err != nil {
		return err
	}
	if !isAdminRole(member.Role) {
		return utils.ErrForbidden
	}
	return s.integrations.Delete(ctx, id)
}

func (s *IntegrationService) HandleWebhook(ctx context.Context, provider, integrationID string, payload []byte, headers http.Header) error {
	integration, err := s.integrations.GetByID(ctx, integrationID)
	if err != nil {
		return err
	}
	handler, ok := s.providers[provider]
	if !ok {
		return utils.ErrIntegrationNotConfigured
	}
	events, err := handler.HandleWebhook(ctx, *integration, payload, headers)
	if err != nil {
		return err
	}
	for _, event := range events {
		if event.Type == "" {
			continue
		}
		if err := s.bus.Publish(ctx, event); err != nil {
			return err
		}
	}
	return nil
}
