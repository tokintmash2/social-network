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

type UserResponse struct {
	ID        int              `json:"id"`
	Email     string           `json:"email"`
	Username  string           `json:"username"`
	FirstName string           `json:"firstName"`
	LastName  string           `json:"lastName"`
	DOB       string           `json:"dob"`
	AboutMe   string           `json:"aboutMe"`
	Avatar    string           `json:"avatar"`
	IsPublic  bool             `json:"isPublic"`
	Followers []PersonResponse `json:"followers"`
}

type Group struct {
	ID          int
	CreatorID   int       `json:"creator_id"`
	Name        string    `json:"group_name"`
	Description string    `json:"group_description"`
	CreatedAt   time.Time `json:"created_at"`
}

type Message struct { // Needs review
	Type              string    `json:"type,omitempty"`
	Sender            int       `json:"sender,omitempty"`
	Recipient         int       `json:"recipient,omitempty"`
	Content           string    `json:"content,omitempty"`
	CreatedAt         time.Time `json:"created_at,omitempty"`
	SenderUsername    string    `json:"sender_username,omitempty"`
	RecipientUsername string    `json:"recipient_username,omitempty"`
	Conversation      struct {
		ID        int `json:"id,omitempty"`
		Recipient int `json:"recipient,omitempty"`
		Sender    int `json:"sender,omitempty"`
	} `json:"conversation,omitempty"`
}

type UserInfo struct { // Needs review
	ID          int
	Username    string
	Avatar      string
	LastMessage time.Time
}

type Post struct {
	ID        int
	UserID    int       `json:"user_id"`
	GroupID   int       `json:"group_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Privacy   string    `json:"privacy"`
	Image     string    `json:"image"`
	CreatedAt time.Time `json:"created_at"`
}

type PostResponse struct {
	ID           int               `json:"id"`
	Title        string            `json:"title"`
	Content      string            `json:"content"`
	Privacy      string            `json:"privacy"`
	Author       PersonResponse    `json:"author"`
	CreatedAt    time.Time         `json:"createdAt"`
	MediaURL     *string           `json:"mediaUrl,omitempty"` // Optional
	AllowedUsers []int             `json:"allowedUsers,omitempty"`
	Comments     []CommentResponse `json:"comments"`
	GroupID      int               `json:"group_id"`
}

type Comment struct {
	ID        int       `json:"id"`
	PostID    int       `json:"post_id"`
	UserID    int       `json:"user_id"`
	Content   string    `json:"content"`
	Image     string    `json:"mediaUrl"`
	CreatedAt time.Time `json:"created_at"`
}

type CommentResponse struct {
	ID             int            `json:"id"`
	PostID         int            `json:"post_id"`
	UserID         int            `json:"user_id"`
	Content        string         `json:"content"`
	Image          *string        `json:"mediaUrl,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	AuthorResponse PersonResponse `json:"author"`
}

type GroupResponse struct {
	ID          int              `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	CreatedAt   string           `json:"created_at"`
	CreatorID   int              `json:"creator_id"`
	Members     []PersonResponse `json:"group_members"`
	GroupPosts  []PostResponse   `json:"group_posts"`
}

type PersonResponse struct {
	ID        int    `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

type GroupMemberResponse struct {
	ID        int    `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Role      string `json:"role"`
}

type Notification struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Message   string    `json:"message"`
	Type      string    `json:"type"`
	LinkTo    string    `json:"linkTo"`
	Read      bool      `json:"read"`
	Timestamp time.Time `json:"timestamp"`
}

type NotificationResponse struct {
	Success       bool           `json:"success"`
	Notifications []Notification `json:"notifications"`
}
