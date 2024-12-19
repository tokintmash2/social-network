package utils

import (
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
