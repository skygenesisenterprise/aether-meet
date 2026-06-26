package utils

import (
	"errors"
	"net/http"
)

type AppError struct {
	Code    string         `json:"code"`
	Message string         `json:"message"`
	Status  int            `json:"-"`
	Details map[string]any `json:"details,omitempty"`
}

func (e *AppError) Error() string {
	return e.Message
}

func NewError(status int, code, message string, details map[string]any) *AppError {
	return &AppError{Status: status, Code: code, Message: message, Details: details}
}

func AsAppError(err error) *AppError {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr
	}
	return NewError(http.StatusInternalServerError, "INTERNAL_ERROR", "An internal error occurred.", nil)
}

var (
	ErrUnauthorized               = NewError(http.StatusUnauthorized, "UNAUTHORIZED", "Authentication is required.", nil)
	ErrForbidden                  = NewError(http.StatusForbidden, "FORBIDDEN", "You are not allowed to access this resource.", nil)
	ErrValidationFailed           = NewError(http.StatusBadRequest, "VALIDATION_FAILED", "The request payload is invalid.", nil)
	ErrWorkspaceNotFound          = NewError(http.StatusNotFound, "WORKSPACE_NOT_FOUND", "The requested workspace was not found.", nil)
	ErrConversationNotFound       = NewError(http.StatusNotFound, "CONVERSATION_NOT_FOUND", "The requested conversation was not found.", nil)
	ErrMessageNotFound            = NewError(http.StatusNotFound, "MESSAGE_NOT_FOUND", "The requested message was not found.", nil)
	ErrMembershipRequired         = NewError(http.StatusForbidden, "MEMBERSHIP_REQUIRED", "Workspace membership is required.", nil)
	ErrMessageEditForbidden       = NewError(http.StatusForbidden, "MESSAGE_EDIT_FORBIDDEN", "You cannot edit this message.", nil)
	ErrMessageDeleteForbidden     = NewError(http.StatusForbidden, "MESSAGE_DELETE_FORBIDDEN", "You cannot delete this message.", nil)
	ErrIntegrationNotConfigured   = NewError(http.StatusServiceUnavailable, "INTEGRATION_NOT_CONFIGURED", "The integration is not configured.", nil)
	ErrMeetingProviderUnavailable = NewError(http.StatusServiceUnavailable, "MEETING_PROVIDER_NOT_CONFIGURED", "A meeting provider is not configured.", nil)
	ErrDependencyUnavailable      = NewError(http.StatusServiceUnavailable, "DEPENDENCY_UNAVAILABLE", "A required dependency is unavailable.", nil)
)
