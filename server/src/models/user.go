package models

import "time"

type User struct {
	Common
	Email       string     `gorm:"type:text;uniqueIndex;not null" json:"email"`
	DisplayName string     `gorm:"type:text;not null" json:"displayName"`
	AvatarURL   string     `gorm:"type:text" json:"avatarUrl,omitempty"`
	Status      string     `gorm:"type:text;not null;default:'offline'" json:"status"`
	DisabledAt  *time.Time `json:"disabledAt,omitempty"`
}
