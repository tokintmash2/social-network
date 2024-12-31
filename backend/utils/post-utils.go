package utils

import (
	"log"
	"social-network/database"
)

func FetchAllowedUsers(postID int) ([]int, error) {
	rows, err := database.DB.Query(`
        SELECT u.id
        FROM post_access pa
        JOIN users u ON pa.follower_id = u.id
        WHERE pa.post_id = ?
    `, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var allowedUsers []int
	for rows.Next() {
		var user int
		if err := rows.Scan(&user); err != nil {
			return nil, err
		}
		allowedUsers = append(allowedUsers, user)
	}
	return allowedUsers, nil
}

func SetPostAccess(postID int, userID int, privacy string, allowedUsers []int) error {
	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if len(allowedUsers) > 0 {
		// Insert specified allowed users
		for _, userID := range allowedUsers {
			_, err = tx.Exec(`
                    INSERT INTO post_access (post_id, follower_id)
                    VALUES (?, ?)`, postID, userID)
			if err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

func UpdatePostAccess(postID, userID int, privacy string, allowedUsers []int) error {
	log.Printf("Starting UpdatePostAccess - PostID: %d, UserID: %d, Privacy: %s", postID, userID, privacy)

	var ownerID int
	err := database.DB.QueryRow(`
        SELECT user_id 
        FROM posts 
        WHERE post_id = ?`, postID).Scan(&ownerID)

	log.Printf("Post %d is owned by user %d, update requested by user %d", postID, ownerID, userID)

	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(`
	UPDATE posts 
	SET privacy_setting = ?
	WHERE post_id = ? AND user_id = ?`,
		privacy, postID, userID)
	if err != nil {
		return err
	}

	result, err := tx.Exec(`UPDATE posts...`)
	rowsAffected, _ := result.RowsAffected()
	log.Printf("Update affected %d rows", rowsAffected)

	// Delete existing post_access entries
	_, err = tx.Exec(`
	DELETE FROM post_access
	WHERE post_id = ?`, postID)
	if err != nil {
		return err
	}

	result, err = tx.Exec(`DELETE FROM post_access...`)
	rowsAffected, _ = result.RowsAffected()
	log.Printf("Delete affected %d rows", rowsAffected)

	// Insert new post_access entries
	if len(allowedUsers) > 0 {
		for _, userID := range allowedUsers {
			_, err = tx.Exec(`
				INSERT INTO post_access (post_id, follower_id)
				VALUES (?, ?)`, postID, userID)
			if err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}
