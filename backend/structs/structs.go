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

type UserBasic struct {
	ID        int
	FirstName string
	LastName  string
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
	ID          int       `json:"id,omitempty"`
	CreatorID   int       `json:"creator_id,omitempty"`
	Name        string    `json:"group_name,omitempty"`
	Description string    `json:"group_description,omitempty"`
	CreatedAt   time.Time `json:"created_at,omitempty"`
}

type Event struct {
	EventID     int              `json:"id"`
	GroupID     int              `json:"group_id"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	DateTime    time.Time        `json:"date_time"`
	CreatedBy   int              `json:"created_by"`
	Author      PersonResponse   `json:"author"`
	Attendees   []PersonResponse `json:"attendees"`
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
	GroupID        int            `json:"group_id"`
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
}

type PersonResponse struct {
	ID        int    `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Role      string `json:"role"`
	Status    string `json:"status"`
}

type Notification struct {
	ID        int       `json:"id"`
	Users     []int     `json:"user_id"`
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
	Read      bool      `json:"read"`
	// LinkTo    string    `json:"linkTo"`
}

type NotificationResponse struct {
	Success       bool           `json:"success"`
	Notifications []Notification `json:"notifications"`
}
