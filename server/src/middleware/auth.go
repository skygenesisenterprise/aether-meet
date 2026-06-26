package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/skygenesisenterprise/aether-meet/server/src/interfaces"
	"github.com/skygenesisenterprise/aether-meet/server/src/utils"
)

const principalKey = "principal"

func Auth(provider interfaces.IdentityProvider) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			utils.Error(c, utils.ErrUnauthorized)
			c.Abort()
			return
		}
		principal, err := provider.Authenticate(c.Request.Context(), strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			utils.Error(c, err)
			c.Abort()
			return
		}
		c.Set(principalKey, *principal)
		c.Next()
	}
}

func PrincipalFromGin(c *gin.Context) (interfaces.Principal, bool) {
	value, ok := c.Get(principalKey)
	if !ok {
		return interfaces.Principal{}, false
	}
	principal, ok := value.(interfaces.Principal)
	return principal, ok
}
