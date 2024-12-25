package utils

import (
	"database/sql"
	"fmt"
	"log"
	"social-network/database"
	"social-network/structs"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func GetSortedUsers(currentUserID int) ([]structs.UserInfo, error) {
	query := `
        SELECT u.id, u.username, MAX(m.timestamp) as last_message
        FROM users u
        LEFT JOIN messages m ON (u.id = m.sender_id AND m.receiver_id = ?) OR (u.id = m.receiver_id AND m.sender_id = ?)
        -- WHERE u.id != ? 
        GROUP BY u.id
        ORDER BY CASE WHEN MAX(m.timestamp) IS NULL THEN 1 ELSE 0 END, 
                 MAX(m.timestamp) DESC, 
                 u.username ASC
    `
	rows, err := database.DB.Query(query, currentUserID, currentUserID, currentUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []structs.UserInfo
	for rows.Next() {
		var user structs.UserInfo
		var lastMessageStr sql.NullString
		if err := rows.Scan(&user.ID, &user.Username, &lastMessageStr); err != nil {
			return nil, err
		}
		if lastMessageStr.Valid {
			lastMessage, err := time.ParseInLocation("2006-01-02 15:04:05.999999-07:00", lastMessageStr.String, time.Local)
			if err != nil {
				return nil, err
			}
			user.LastMessage = lastMessage
		}
		users = append(users, user)
	}
	return users, nil
}

func GetUsername(userID int) (string, error) {
	var username sql.NullString
	err := database.DB.QueryRow("SELECT username FROM users WHERE id = ?", userID).Scan(&username)
	if err != nil {
		// Check for 'no rows in result set' error specifically
		if err == sql.ErrNoRows {
			return "Unknown", nil
		}
		return "", fmt.Errorf("error fetching username for userID %d: %w", userID, err)
	}
	// Check if the username is NULL before assigning
	if username.Valid {
		return username.String, nil
	}
	return "Unknown", nil
}

func GetUserProfile(userID int) (structs.User, error) {
	var userProfile structs.User
	err := database.DB.QueryRow(`
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.dob, u.avatar, u.about_me, u.is_public
        FROM users u
        WHERE u.id = ?`,
		userID,
	).Scan(
		&userProfile.ID,
		&userProfile.Username,
		&userProfile.Email,
		&userProfile.FirstName,
		&userProfile.LastName,
		&userProfile.DOB,
		&userProfile.Avatar,
		&userProfile.AboutMe,
		&userProfile.IsPublic,
	)
	if err != nil {
		return structs.User{}, err
	}
	return userProfile, nil
}

func GetAllUsers() ([]structs.UserBasic, error) {
	rows, err := database.DB.Query(`
        SELECT id, first_name, last_name
        FROM users
    `)
	if err != nil {
		log.Printf("Error querying all users: %v", err)
		return nil, err
	}
	defer rows.Close()

	var users []structs.UserBasic
	for rows.Next() {
		var user structs.UserBasic
		err := rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
		)
		if err != nil {
			log.Printf("Error scanning user row: %v", err)
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func ToggleUserPrivacy(userID int) error {
	_, err := database.DB.Exec(`
        UPDATE users
        SET is_public = NOT is_public
        WHERE id = ?`,
		userID,
	)
	return err
}

func VerifyUser(user structs.User) (int, bool) {
	log.Println("Verifying user:", user)
	var storedPassword string
	var userID int

	err := database.DB.QueryRow(`
    SELECT id, password 
    FROM users 
    WHERE (email = ?) 
    LIMIT 1`,
		user.Email,
		// user.Identifier, user.Identifier,
	).Scan(&userID, &storedPassword)
	log.Println("Useri email:", user.Email)
	// log.Println("User identifier", user.Identifier)
	// log.Printf("Looking up user with identifier: %s", user.Identifier)

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
