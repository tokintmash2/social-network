package utils

import (
	"fmt"
	"log"
	"social-network/database"
	"social-network/structs"
	"strings"
)

func CreateNotification(users []int, notification *structs.Notification) ([]structs.Notification, error) {

	// WHen adding new types of notifications,
	// they must also be added to the migration file

	log.Println("About to start creating notification: ", notification)

	tx, err := database.DB.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback() // Will be ignored if tx.Commit() is called

	stmt, err := tx.Prepare(`
        INSERT INTO notifications (user_id, type, message, created_at, seen_status)
        VALUES (?, ?, ?, ?, ?)
		RETURNING notification_id
    `)

	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	// Insert a notification for each user in the Users slice
	var notificationIDs []int
	for _, userID := range users {
		var ID int
		err = stmt.QueryRow(
			userID,
			notification.Type,
			notification.Message,
			notification.Timestamp,
			notification.Read,
		).Scan(&ID)

		if err != nil {
			log.Printf("Error inserting notification: %v", err)
			return nil, err
		}
		notificationIDs = append(notificationIDs, ID)
	}
	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	query, args := buildInQuery(`
	SELECT notification_id, user_id, type, message, created_at, seen_status
	FROM notifications
	WHERE notification_id IN (%s)
	`, notificationIDs)

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	notifications := []structs.Notification{}

	for rows.Next() {
		var notification structs.Notification
		err := rows.Scan(
			&notification.ID,
			&notification.UserID,
			&notification.Type,
			&notification.Message,
			&notification.Timestamp,
			&notification.Read)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}
	return notifications, nil
}

func buildInQuery(query string, args []int) (string, []interface{}) {
	placeholders := make([]string, len(args))
	interfaceArgs := make([]interface{}, len(args))
	for i, arg := range args {
		placeholders[i] = "?"
		interfaceArgs[i] = arg
	}
	query = fmt.Sprintf(query, strings.Join(placeholders, ", "))
	return query, interfaceArgs
}

func FetchNotifications(userID int) ([]structs.Notification, error) {

	rows, err := database.DB.Query(`
        SELECT notification_id, user_id, type, message, created_at, seen_status
        FROM notifications
        WHERE user_id = ? AND seen_status = 0
        ORDER BY created_at DESC
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	notifications := []structs.Notification{}

	for rows.Next() {
		var notification structs.Notification
		err := rows.Scan(
			&notification.ID,
			&notification.UserID,
			&notification.Type,
			&notification.Message,
			&notification.Timestamp,
			&notification.Read)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}
	return notifications, nil
}

func MarkNotificationAsRead(notificationID int) error {
	_, err := database.DB.Exec("UPDATE notifications SET seen_status = 1 WHERE notification_id = ?",
		notificationID)
	if err != nil {
		return fmt.Errorf("error marking notification as read: %v", err)
	}
	return nil
}
