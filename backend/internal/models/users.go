package models

import (
	"database/sql"
)

type UserModel struct {
	DB *sql.DB
}

// type UserProfile struct {
// 	UserID    int    `json:"user_id"`
// 	Username  string `json:"username"`
// 	Age       int32  `json:"age"`
// 	Gender    string `json:"gender"`
// 	FirstName string `json:"firstname"`
// 	LastName  string `json:"lastname"`
// 	Email     string `json:"email"`
// }
