package utils

import (
	"fmt"
	"social-network/database"
	"social-network/structs"
)

func CreateNotification(notification *structs.Notification) error {

	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback() // Will be ignored if tx.Commit() is called

	stmt, err := tx.Prepare(`
        INSERT INTO notifications (user_id, type, message, created_at, seen_status)
        VALUES (?, ?, ?, ?, ?)
    `)
	if err != nil {
		return err
	}
	defer stmt.Close()

	// Insert a notification for each user in the Users slice
	for _, userID := range notification.Users {
		_, err = stmt.Exec(
			userID,
			notification.Type,
			notification.Message,
			notification.Timestamp,
			notification.Read,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func FetchNotifications(userID int) ([]structs.Notification, error) {

	rows, err := database.DB.Query(`
        SELECT notification_id, type, message, created_at, seen_status
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
