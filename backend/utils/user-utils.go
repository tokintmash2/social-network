package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"

	"golang.org/x/crypto/bcrypt"
)

func VerifyUser(user structs.User) (int, bool) {
	log.Println("Verifying user:", user)
	var storedPassword string
	var userID int
	err := database.DB.QueryRow(`
    SELECT id, password 
    FROM users 
    WHERE (email = ? OR username = ?) 
    LIMIT 1`,
		user.Identifier, user.Identifier,
	).Scan(&userID, &storedPassword)
	log.Println("Useri email:", user.Email)
	log.Println("User identifier", user.Identifier)
	log.Printf("Looking up user with identifier: %s", user.Identifier)

	if err != nil {
		log.Println("Error verifying user:", err)
		return 0, false
	}
	err = bcrypt.CompareHashAndPassword([]byte(storedPassword), []byte(user.Password))
	log.Println("Verifying user", userID, err)
	return userID, err == nil
}

func CreateUser(user structs.User) (int, error) {
	// Hash the password before storing
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return 0, err
	}

	// SQL query to insert new user
	query := `
		INSERT INTO users (email, password, first_name, last_name, dob, username, avatar, about_me)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`

	// Execute the query
	result, err := database.DB.Exec(query,
		user.Email,
		string(hashedPassword),
		user.FirstName,
		user.LastName,
		user.DOB,
		user.Username,
		user.Avatar,
		user.AboutMe,
	)

	if err != nil {
		return 0, err
	}

	// Get the ID of the newly created user
	userID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	log.Println("New user ID:", userID)

	return int(userID), nil
}

func SetUserOnline(userID int) error {
	_, err := database.DB.Exec("INSERT OR REPLACE INTO online_status (user_id, online_status) VALUES (?, ?)", userID, true)
	if err != nil {
		log.Println("Error setting user online:", err)
		return err
	}
	return nil
}

// HashPassword hashes a plain-text password
func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

// CheckPassword compares a hashed password with a plain-text password
func CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
