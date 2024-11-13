package structs

import "time"

type User struct {
	ID         int
	Email      string
	Password   string
	Username   string
	FirstName  string
	LastName   string
	Age        int
	DOB        time.Time
	AboutMe    string
	Avatar     string
	Gender     string
}

type Message struct { // Needs review
	Type         string
	Sender       int
	Recipient    string
	Content      string
	CreatedAt    time.Time
	SenderUsername string
	ReceiverUsername string
	Conversation struct {
		ID        int
		Recipient int
		Sender    int
	}
}

type UserInfo struct { // Needs review
	ID       int
	Username string
	Avatar   string
	LastMessage time.Time
}
