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
	Identifier string
}
