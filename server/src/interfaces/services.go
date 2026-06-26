package interfaces

import (
	"context"
	"io"
	"net/http"
	"time"

	"github.com/skygenesisenterprise/aether-meet/server/src/models"
)

type Principal struct {
	UserID      string   `json:"userId"`
	WorkspaceID string   `json:"workspaceId,omitempty"`
	Roles       []string `json:"roles,omitempty"`
	Permissions []string `json:"permissions,omitempty"`
	SessionID   string   `json:"sessionId,omitempty"`
}

type IdentityProvider interface {
	Authenticate(ctx context.Context, token string) (*Principal, error)
	IssueToken(ctx context.Context, principal Principal) (string, error)
}

type ProviderRoom struct {
	ID  string `json:"id"`
	URL string `json:"url,omitempty"`
}

type MeetingProvider interface {
	CreateRoom(ctx context.Context, meeting models.Meeting) (*ProviderRoom, error)
	CreateJoinToken(ctx context.Context, meeting models.Meeting, principal Principal) (string, error)
	EndRoom(ctx context.Context, meeting models.Meeting) error
}

type Object struct {
	Key         string
	ContentType string
	Body        io.Reader
	Size        int64
}

type ObjectStorage interface {
	Put(ctx context.Context, object Object) error
	Get(ctx context.Context, key string) (io.ReadCloser, error)
	Delete(ctx context.Context, key string) error
	SignedURL(ctx context.Context, key string, ttl time.Duration) (string, error)
}

type IntegrationProvider interface {
	Name() string
	ValidateConfiguration(ctx context.Context, config map[string]any) error
	HandleWebhook(ctx context.Context, integration models.Integration, payload []byte, headers http.Header) ([]Event, error)
}
