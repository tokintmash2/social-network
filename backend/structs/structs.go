package structs

import "time"

type User struct {
	ID        int
	Email     string
	Password  string
	Username  string
	FirstName string
	LastName  string
	DOB       time.Time
	AboutMe   string
	Avatar    string
	IsPublic  bool
	// Age       int
	// Gender    string
}

type Group struct {
	ID          int
	CreatorID   int       `json:"creator_id"`
	Name        string    `json:"group_name"`
	Description string    `json:"group_description"`
	CreatedAt   time.Time `json:"created_at"`
}

type Message struct { // Needs review
	Type             string
	Sender           int
	Recipient        string
	Content          string
	CreatedAt        time.Time
	SenderUsername   string
	ReceiverUsername string
	Conversation     struct {
		ID        int
		Recipient int
		Sender    int
	}
}

type UserInfo struct { // Needs review
	ID          int
	Username    string
	Avatar      string
	LastMessage time.Time
}

type Post struct { // Need review
	ID        int
	UserID    int       `json:"user_id"`
	GroupID   int       `json:"group_id"`
	Content   string    `json:"content"`
	Privacy   string    `json:"privacy"`
	Image     string    `json:"image"`
	CreatedAt time.Time `json:"created_at"`
}

type PostResponse struct {
    ID           int                    `json:"id"`
    Title        string                 `json:"title"`
    Content      string                 `json:"content"`
    Privacy      string                 `json:"privacy"`
    Author       AuthorResponse         `json:"author"`
    CreatedAt    string                 `json:"createdAt"`
    MediaURL     *string                `json:"mediaUrl,omitempty"` // Optional
    AllowedUsers []AllowedUserResponse  `json:"allowedUsers,omitempty"`
}

type AuthorResponse struct {
    ID        int    `json:"id"`
    FirstName string `json:"firstName"`
    LastName  string `json:"lastName"`
}

type AllowedUserResponse struct {
    ID        int    `json:"id"`
    FirstName string `json:"firstName"`
    LastName  string `json:"lastName"`
}
