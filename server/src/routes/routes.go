package routes

import (
	"context"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	redisclient "github.com/skygenesisenterprise/aether-meet/server/internal/redis"
	"github.com/skygenesisenterprise/aether-meet/server/src/config"
	"github.com/skygenesisenterprise/aether-meet/server/src/interfaces"
	"github.com/skygenesisenterprise/aether-meet/server/src/middleware"
	"github.com/skygenesisenterprise/aether-meet/server/src/services"
	"github.com/skygenesisenterprise/aether-meet/server/src/utils"
)

type Dependencies struct {
	Config              config.Config
	Logger              *slog.Logger
	Database            interfaces.Database
	Redis               *redisclient.Client
	EventBus            interfaces.EventBus
	IdentityProvider    interfaces.IdentityProvider
	Hub                 *services.Hub
	UserService         *services.UserService
	WorkspaceService    *services.WorkspaceService
	TeamService         *services.TeamService
	ChannelService      *services.ChannelService
	ConversationService *services.ConversationService
	MessageService      *services.MessageService
	MeetingService      *services.MeetingService
	IntegrationService  *services.IntegrationService
	AuditService        *services.AuditService
}

func SetupRoutes(router *gin.Engine, deps Dependencies) {
	handler := &apiHandler{deps: deps}

	api := router.Group("/api/v1")
	api.GET("/health", handler.health)
	api.GET("/ready", handler.ready)
	api.POST("/webhooks/:provider/:integrationId", handler.webhook)

	protected := api.Group("")
	protected.Use(middleware.Auth(deps.IdentityProvider))
	protected.Use(middleware.WorkspaceContext())
	{
		protected.GET("/me", handler.me)
		protected.PATCH("/me", handler.updateMe)

		protected.GET("/workspaces", handler.listWorkspaces)
		protected.POST("/workspaces", handler.createWorkspace)
		protected.GET("/workspaces/:workspaceId", handler.getWorkspace)
		protected.PATCH("/workspaces/:workspaceId", handler.updateWorkspace)
		protected.DELETE("/workspaces/:workspaceId", handler.deleteWorkspace)

		protected.GET("/workspaces/:workspaceId/members", handler.listWorkspaceMembers)
		protected.POST("/workspaces/:workspaceId/members", handler.createWorkspaceMember)
		protected.PATCH("/workspaces/:workspaceId/members/:userId", handler.updateWorkspaceMember)
		protected.DELETE("/workspaces/:workspaceId/members/:userId", handler.deleteWorkspaceMember)

		protected.GET("/workspaces/:workspaceId/teams", handler.listTeams)
		protected.POST("/workspaces/:workspaceId/teams", handler.createTeam)
		protected.GET("/teams/:teamId", handler.getTeam)
		protected.PATCH("/teams/:teamId", handler.updateTeam)
		protected.DELETE("/teams/:teamId", handler.deleteTeam)

		protected.GET("/workspaces/:workspaceId/channels", handler.listChannels)
		protected.POST("/workspaces/:workspaceId/channels", handler.createChannel)
		protected.GET("/channels/:channelId", handler.getChannel)
		protected.PATCH("/channels/:channelId", handler.updateChannel)
		protected.DELETE("/channels/:channelId", handler.deleteChannel)

		protected.GET("/workspaces/:workspaceId/conversations", handler.listConversations)
		protected.POST("/workspaces/:workspaceId/conversations", handler.createConversation)
		protected.GET("/conversations/:conversationId", handler.getConversation)
		protected.PATCH("/conversations/:conversationId", handler.updateConversation)
		protected.DELETE("/conversations/:conversationId", handler.deleteConversation)

		protected.GET("/conversations/:conversationId/messages", handler.listMessages)
		protected.POST("/conversations/:conversationId/messages", handler.createMessage)
		protected.POST("/conversations/:conversationId/read", handler.markRead)
		protected.GET("/messages/:messageId", handler.getMessage)
		protected.PATCH("/messages/:messageId", handler.updateMessage)
		protected.DELETE("/messages/:messageId", handler.deleteMessage)
		protected.POST("/messages/:messageId/reactions", handler.createReaction)
		protected.DELETE("/messages/:messageId/reactions/:emoji", handler.deleteReaction)

		protected.GET("/workspaces/:workspaceId/meetings", handler.listMeetings)
		protected.POST("/workspaces/:workspaceId/meetings", handler.createMeeting)
		protected.GET("/meetings/:meetingId", handler.getMeeting)
		protected.POST("/meetings/:meetingId/start", handler.startMeeting)
		protected.POST("/meetings/:meetingId/end", handler.endMeeting)
		protected.POST("/meetings/:meetingId/join-token", handler.meetingJoinToken)

		protected.GET("/workspaces/:workspaceId/applications", handler.listApplications)
		protected.POST("/workspaces/:workspaceId/applications", handler.createApplication)
		protected.GET("/applications/:applicationId", handler.getApplication)
		protected.PATCH("/applications/:applicationId", handler.updateApplication)
		protected.DELETE("/applications/:applicationId", handler.deleteApplication)

		protected.GET("/workspaces/:workspaceId/audit-logs", handler.listAuditLogs)

		protected.GET("/realtime/ws", handler.realtime)
	}
}

type apiHandler struct {
	deps Dependencies
}

func (h *apiHandler) principal(c *gin.Context) (interfaces.Principal, bool) {
	return middleware.PrincipalFromGin(c)
}

func (h *apiHandler) health(c *gin.Context) {
	status := "healthy"
	redisStatus := "disabled"
	if err := h.deps.Database.Ping(c.Request.Context()); err != nil {
		status = "degraded"
	}
	if h.deps.Redis != nil {
		redisHealth := h.deps.Redis.Health(c.Request.Context())
		redisStatus = string(redisHealth.Status)
		if redisHealth.Status != redisclient.StatusHealthy {
			status = "degraded"
		}
	}
	realtimeStatus := "healthy"
	if !h.deps.Config.Realtime.Enabled {
		realtimeStatus = "disabled"
	}
	utils.Success(c, http.StatusOK, gin.H{
		"status":   status,
		"database": "healthy",
		"redis":    redisStatus,
		"realtime": realtimeStatus,
		"version":  h.deps.Config.App.Version,
	})
}

func (h *apiHandler) ready(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	result := gin.H{"database": "healthy", "redis": "disabled", "realtime": "healthy"}
	if err := h.deps.Database.Ping(ctx); err != nil {
		result["database"] = "unhealthy"
		utils.Error(c, utils.ErrDependencyUnavailable)
		return
	}
	if h.deps.Config.Redis.Enabled {
		if h.deps.Redis == nil || !h.deps.Redis.IsAvailable() {
			if h.deps.Config.Redis.Required {
				result["redis"] = "unhealthy"
				utils.Error(c, utils.ErrDependencyUnavailable)
				return
			}
			result["redis"] = "unavailable"
		} else {
			result["redis"] = "healthy"
		}
	}
	if h.deps.Config.Realtime.Enabled {
		if err := h.deps.EventBus.Healthy(ctx); err != nil {
			result["realtime"] = "unhealthy"
			utils.Error(c, utils.ErrDependencyUnavailable)
			return
		}
	}
	utils.Success(c, http.StatusOK, gin.H{
		"status":   "ready",
		"database": result["database"],
		"redis":    result["redis"],
		"realtime": result["realtime"],
		"version":  h.deps.Config.App.Version,
	})
}

func (h *apiHandler) me(c *gin.Context) {
	principal, _ := h.principal(c)
	user, err := h.deps.UserService.GetMe(c.Request.Context(), principal)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, user)
}

func (h *apiHandler) updateMe(c *gin.Context) {
	var req struct {
		DisplayName string `json:"displayName"`
		AvatarURL   string `json:"avatarUrl"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	user, err := h.deps.UserService.UpdateMe(c.Request.Context(), principal, req.DisplayName, req.AvatarURL, req.Status)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, user)
}

func (h *apiHandler) listWorkspaces(c *gin.Context) {
	principal, _ := h.principal(c)
	items, err := h.deps.WorkspaceService.List(c.Request.Context(), principal)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", false)
}

func (h *apiHandler) createWorkspace(c *gin.Context) {
	var req struct {
		Name        string `json:"name"`
		Slug        string `json:"slug"`
		Description string `json:"description"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	item, err := h.deps.WorkspaceService.Create(c.Request.Context(), principal, req.Name, req.Slug, req.Description)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *apiHandler) getWorkspace(c *gin.Context)    { h.workspaceResource(c, "get") }
func (h *apiHandler) updateWorkspace(c *gin.Context) { h.workspaceResource(c, "update") }
func (h *apiHandler) deleteWorkspace(c *gin.Context) { h.workspaceResource(c, "delete") }

func (h *apiHandler) workspaceResource(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	id := c.Param("workspaceId")
	switch action {
	case "get":
		item, err := h.deps.WorkspaceService.Get(c.Request.Context(), principal, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "update":
		var req struct{ Name, Description string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.WorkspaceService.Update(c.Request.Context(), principal, id, req.Name, req.Description)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "delete":
		if err := h.deps.WorkspaceService.Archive(c.Request.Context(), principal, id); err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, gin.H{"deleted": true})
	}
}

func (h *apiHandler) listWorkspaceMembers(c *gin.Context)  { h.membersResource(c, "list") }
func (h *apiHandler) createWorkspaceMember(c *gin.Context) { h.membersResource(c, "create") }
func (h *apiHandler) updateWorkspaceMember(c *gin.Context) { h.membersResource(c, "update") }
func (h *apiHandler) deleteWorkspaceMember(c *gin.Context) { h.membersResource(c, "delete") }

func (h *apiHandler) membersResource(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	workspaceID := c.Param("workspaceId")
	switch action {
	case "list":
		items, err := h.deps.WorkspaceService.ListMembers(c.Request.Context(), principal, workspaceID)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.List(c, items, "", false)
	case "create":
		var req struct{ UserID, Role string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.WorkspaceService.AddMember(c.Request.Context(), principal, workspaceID, req.UserID, req.Role)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusCreated, item)
	case "update":
		var req struct{ Role string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.WorkspaceService.UpdateMember(c.Request.Context(), principal, workspaceID, c.Param("userId"), req.Role)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "delete":
		if err := h.deps.WorkspaceService.RemoveMember(c.Request.Context(), principal, workspaceID, c.Param("userId")); err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, gin.H{"deleted": true})
	}
}

func (h *apiHandler) listTeams(c *gin.Context)          { h.teamCollection(c, "list") }
func (h *apiHandler) createTeam(c *gin.Context)         { h.teamCollection(c, "create") }
func (h *apiHandler) getTeam(c *gin.Context)            { h.teamItem(c, "get") }
func (h *apiHandler) updateTeam(c *gin.Context)         { h.teamItem(c, "update") }
func (h *apiHandler) deleteTeam(c *gin.Context)         { h.teamItem(c, "delete") }
func (h *apiHandler) listChannels(c *gin.Context)       { h.channelCollection(c, "list") }
func (h *apiHandler) createChannel(c *gin.Context)      { h.channelCollection(c, "create") }
func (h *apiHandler) getChannel(c *gin.Context)         { h.channelItem(c, "get") }
func (h *apiHandler) updateChannel(c *gin.Context)      { h.channelItem(c, "update") }
func (h *apiHandler) deleteChannel(c *gin.Context)      { h.channelItem(c, "delete") }
func (h *apiHandler) listConversations(c *gin.Context)  { h.conversationCollection(c, "list") }
func (h *apiHandler) createConversation(c *gin.Context) { h.conversationCollection(c, "create") }
func (h *apiHandler) getConversation(c *gin.Context)    { h.conversationItem(c, "get") }
func (h *apiHandler) updateConversation(c *gin.Context) { h.conversationItem(c, "update") }
func (h *apiHandler) deleteConversation(c *gin.Context) { h.conversationItem(c, "delete") }

func (h *apiHandler) teamCollection(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	workspaceID := c.Param("workspaceId")
	switch action {
	case "list":
		items, err := h.deps.TeamService.List(c.Request.Context(), principal, workspaceID)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.List(c, items, "", false)
	case "create":
		var req struct{ Name, Description string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.TeamService.Create(c.Request.Context(), principal, workspaceID, req.Name, req.Description)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusCreated, item)
	}
}

func (h *apiHandler) teamItem(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	id := c.Param("teamId")
	switch action {
	case "get":
		item, err := h.deps.TeamService.Get(c.Request.Context(), principal, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "update":
		var req struct{ Name, Description string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.TeamService.Update(c.Request.Context(), principal, id, req.Name, req.Description)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "delete":
		if err := h.deps.TeamService.Delete(c.Request.Context(), principal, id); err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, gin.H{"deleted": true})
	}
}

func (h *apiHandler) channelCollection(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	workspaceID := c.Param("workspaceId")
	switch action {
	case "list":
		items, err := h.deps.ChannelService.List(c.Request.Context(), principal, workspaceID)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.List(c, items, "", false)
	case "create":
		var req struct {
			TeamID      *string `json:"teamId"`
			Name        string  `json:"name"`
			Slug        string  `json:"slug"`
			Description string  `json:"description"`
			Type        string  `json:"type"`
			Visibility  string  `json:"visibility"`
		}
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.ChannelService.Create(c.Request.Context(), principal, workspaceID, req.TeamID, req.Name, req.Slug, req.Description, req.Type, req.Visibility)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusCreated, item)
	}
}

func (h *apiHandler) channelItem(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	id := c.Param("channelId")
	switch action {
	case "get":
		item, err := h.deps.ChannelService.Get(c.Request.Context(), principal, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "update":
		var req struct{ Name, Description, Visibility string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.ChannelService.Update(c.Request.Context(), principal, id, req.Name, req.Description, req.Visibility)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "delete":
		if err := h.deps.ChannelService.Delete(c.Request.Context(), principal, id); err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, gin.H{"deleted": true})
	}
}

func (h *apiHandler) conversationCollection(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	workspaceID := c.Param("workspaceId")
	switch action {
	case "list":
		items, err := h.deps.ConversationService.List(c.Request.Context(), principal, workspaceID)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.List(c, items, "", false)
	case "create":
		var req struct {
			Type      string   `json:"type"`
			Name      string   `json:"name"`
			MemberIDs []string `json:"memberIds"`
		}
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.ConversationService.Create(c.Request.Context(), principal, workspaceID, req.Type, req.Name, req.MemberIDs)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusCreated, item)
	}
}

func (h *apiHandler) conversationItem(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	id := c.Param("conversationId")
	switch action {
	case "get":
		item, err := h.deps.ConversationService.Get(c.Request.Context(), principal, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "update":
		var req struct{ Name string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.ConversationService.Update(c.Request.Context(), principal, id, req.Name)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "delete":
		if err := h.deps.ConversationService.Delete(c.Request.Context(), principal, id); err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, gin.H{"deleted": true})
	}
}

func (h *apiHandler) listMessages(c *gin.Context) {
	principal, _ := h.principal(c)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	items, next, hasMore, err := h.deps.MessageService.List(c.Request.Context(), principal, c.Param("conversationId"), c.Query("cursor"), limit)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, next, hasMore)
}

func (h *apiHandler) createMessage(c *gin.Context) {
	var req struct {
		Type     string         `json:"type"`
		Content  string         `json:"content"`
		Metadata map[string]any `json:"metadata"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	item, err := h.deps.MessageService.Create(c.Request.Context(), principal, c.Param("conversationId"), req.Type, req.Content, c.GetHeader("Idempotency-Key"), req.Metadata)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *apiHandler) getMessage(c *gin.Context) {
	principal, _ := h.principal(c)
	item, err := h.deps.MessageService.Get(c.Request.Context(), principal, c.Param("messageId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *apiHandler) updateMessage(c *gin.Context) {
	var req struct{ Content string }
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	item, err := h.deps.MessageService.Update(c.Request.Context(), principal, c.Param("messageId"), req.Content)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, item)
}

func (h *apiHandler) deleteMessage(c *gin.Context) {
	principal, _ := h.principal(c)
	if err := h.deps.MessageService.Delete(c.Request.Context(), principal, c.Param("messageId")); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *apiHandler) createReaction(c *gin.Context) {
	var req struct {
		Emoji string `json:"emoji"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	item, err := h.deps.MessageService.AddReaction(c.Request.Context(), principal, c.Param("messageId"), req.Emoji)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *apiHandler) deleteReaction(c *gin.Context) {
	principal, _ := h.principal(c)
	if err := h.deps.MessageService.RemoveReaction(c.Request.Context(), principal, c.Param("messageId"), c.Param("emoji")); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"deleted": true})
}

func (h *apiHandler) markRead(c *gin.Context) {
	var req struct {
		MessageID string `json:"messageId"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	if err := h.deps.MessageService.MarkRead(c.Request.Context(), principal, c.Param("conversationId"), req.MessageID); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"updated": true})
}

func (h *apiHandler) listMeetings(c *gin.Context) {
	principal, _ := h.principal(c)
	items, err := h.deps.MeetingService.List(c.Request.Context(), principal, c.Param("workspaceId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", false)
}

func (h *apiHandler) createMeeting(c *gin.Context) {
	var req struct {
		Title          string  `json:"title"`
		ConversationID *string `json:"conversationId"`
	}
	if c.ShouldBindJSON(&req) != nil {
		utils.Error(c, utils.ErrValidationFailed)
		return
	}
	principal, _ := h.principal(c)
	item, err := h.deps.MeetingService.Create(c.Request.Context(), principal, c.Param("workspaceId"), req.Title, req.ConversationID)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusCreated, item)
}

func (h *apiHandler) getMeeting(c *gin.Context)   { h.meetingAction(c, "get") }
func (h *apiHandler) startMeeting(c *gin.Context) { h.meetingAction(c, "start") }
func (h *apiHandler) endMeeting(c *gin.Context)   { h.meetingAction(c, "end") }

func (h *apiHandler) meetingAction(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	id := c.Param("meetingId")
	switch action {
	case "get":
		item, err := h.deps.MeetingService.Get(c.Request.Context(), principal, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "start":
		item, err := h.deps.MeetingService.Start(c.Request.Context(), principal, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	case "end":
		item, err := h.deps.MeetingService.End(c.Request.Context(), principal, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, item)
	}
}

func (h *apiHandler) meetingJoinToken(c *gin.Context) {
	principal, _ := h.principal(c)
	token, err := h.deps.MeetingService.JoinToken(c.Request.Context(), principal, c.Param("meetingId"))
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusOK, gin.H{"token": token})
}

func (h *apiHandler) listApplications(c *gin.Context)  { h.applicationCollection(c, "list") }
func (h *apiHandler) createApplication(c *gin.Context) { h.applicationCollection(c, "create") }
func (h *apiHandler) getApplication(c *gin.Context)    { h.applicationItem(c, "get") }
func (h *apiHandler) updateApplication(c *gin.Context) { h.applicationItem(c, "update") }
func (h *apiHandler) deleteApplication(c *gin.Context) { h.applicationItem(c, "delete") }

func (h *apiHandler) applicationCollection(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	workspaceID := c.Param("workspaceId")
	switch action {
	case "list":
		items, err := h.deps.IntegrationService.List(c.Request.Context(), principal, workspaceID)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.List(c, items, "", false)
	case "create":
		var req struct {
			Provider      string         `json:"provider"`
			Name          string         `json:"name"`
			Configuration map[string]any `json:"configuration"`
		}
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.IntegrationService.Create(c.Request.Context(), principal, workspaceID, req.Provider, req.Name, req.Configuration)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusCreated, item)
	}
}

func (h *apiHandler) applicationItem(c *gin.Context, action string) {
	principal, _ := h.principal(c)
	id := c.Param("applicationId")
	switch action {
	case "get":
		item, err := h.deps.IntegrationService.Get(c.Request.Context(), principal, id)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, sanitizeIntegration(item))
	case "update":
		var req struct{ Name, Status string }
		if c.ShouldBindJSON(&req) != nil {
			utils.Error(c, utils.ErrValidationFailed)
			return
		}
		item, err := h.deps.IntegrationService.Update(c.Request.Context(), principal, id, req.Name, req.Status)
		if err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, sanitizeIntegration(item))
	case "delete":
		if err := h.deps.IntegrationService.Delete(c.Request.Context(), principal, id); err != nil {
			utils.Error(c, err)
			return
		}
		utils.Success(c, http.StatusOK, gin.H{"deleted": true})
	}
}

func (h *apiHandler) webhook(c *gin.Context) {
	payload, _ := io.ReadAll(io.LimitReader(c.Request.Body, 1<<20))
	if err := h.deps.IntegrationService.HandleWebhook(c.Request.Context(), c.Param("provider"), c.Param("integrationId"), payload, c.Request.Header); err != nil {
		utils.Error(c, err)
		return
	}
	utils.Success(c, http.StatusAccepted, gin.H{"accepted": true})
}

func (h *apiHandler) listAuditLogs(c *gin.Context) {
	principal, _ := h.principal(c)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	items, err := h.deps.AuditService.List(c.Request.Context(), principal, c.Param("workspaceId"), limit)
	if err != nil {
		utils.Error(c, err)
		return
	}
	utils.List(c, items, "", false)
}

func (h *apiHandler) realtime(c *gin.Context) {
	principal, ok := h.principal(c)
	if !ok {
		utils.Error(c, utils.ErrUnauthorized)
		return
	}
	h.deps.Hub.Handle(c, principal)
}

func sanitizeIntegration(item any) any {
	return item
}
