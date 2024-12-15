package utils

import (
	"fmt"
	"log"
	"social-network/database"
	"social-network/structs"
)

func AddFollower(followerID, followedID int) error {
	log.Println("AddFollower called")
	log.Println("followerID: ", followerID)
	log.Println("followingID: ", followedID)

	if followerID == followedID {
		return fmt.Errorf("cannot follow yourself")
	}

	tx, err := database.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	status, err := determineFollowStatus(followedID)
	if err != nil {
		return err
	}

	err = createFollowRelationship(followerID, followedID, status)
	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	log.Println("Added follower successfully")

	return nil
}

func determineFollowStatus(followedID int) (string, error) {
	var isPublic bool
	err := database.DB.QueryRow("SELECT is_public FROM users WHERE id = ?", followedID).Scan(&isPublic)
	if err != nil {
		return "", err
	}

	if isPublic {
		return "accepted", nil
	}
	return "pending", nil
}

func createFollowRelationship(followerID, followedID int, status string) error {
	_, err := database.DB.Exec(`
		INSERT INTO followers (follower_id, followed_id, status)
		VALUES (?, ?, ?)`,
		followerID, followedID, status,
	)
	return err
}

func RemoveFollower(followerID, followedID int) error {
	_, err := database.DB.Exec(`
        DELETE FROM followers
        WHERE follower_id = ? AND followed_id = ?`,
		followerID, followedID,
	)
	return err
}
func GetFollowers(userID int) ([]structs.PersonResponse, error) {

	var followers []structs.PersonResponse

	rows, err := database.DB.Query(`
        SELECT u.id, u.first_name, u.last_name 
        FROM users u
        JOIN followers f ON u.id = f.follower_id
        WHERE f.followed_id = ? AND f.status = 'accepted'`,
		userID,
	)
	if err != nil {
		return followers, err
	}
	defer rows.Close()

	// 4. Populate followers slice
	for rows.Next() {
		var follower structs.PersonResponse
		if err := rows.Scan(&follower.ID, &follower.FirstName, &follower.LastName); err != nil {
			return followers, err
		}
		followers = append(followers, follower)
	}
	return followers, nil
}
