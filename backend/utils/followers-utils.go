package utils

import (
	"database/sql"
	"fmt"
	"log"
	"social-network/database"
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
	log.Printf("Removing follower relationship: follower=%d, followed=%d", followerID, followedID)

	if followerID == followedID {
		return fmt.Errorf("invalid operation: cannot unfollow yourself")
	}

	tx, err := database.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	result, err := tx.Exec(`
        DELETE FROM followers
        WHERE follower_id = ? AND followed_id = ?`,
		followerID, followedID,
	)
	if err != nil {
		return fmt.Errorf("error removing follower: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking affected rows: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no follower relationship found between users %d and %d", followerID, followedID)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	log.Printf("Successfully removed follower relationship")
	return nil
}

func GetFollowers(userID int) ([]int, error) {
	log.Printf("Getting followers for user %d", userID)

	rows, err := database.DB.Query(`
        SELECT follower_id 
        FROM followers 
        WHERE followed_id = ?`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("error querying followers: %v", err)
	}
	defer rows.Close()

	var followers []int
	for rows.Next() {
		var followerID int
		if err := rows.Scan(&followerID); err != nil {
			return nil, fmt.Errorf("error scanning follower data: %v", err)
		}
		followers = append(followers, followerID)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over followers: %v", err)
	}

	log.Printf("Retrieved %d followers successfully", len(followers))
	return followers, nil
}

func GetFollowerStatus(followerID, followedID int) (string, error) {

	var status string
    
	err := database.DB.QueryRow(`
        SELECT status 
        FROM followers 
        WHERE follower_id = ? AND followed_id = ?`,
        followerID, followedID,
    ).Scan(&status)
    
    if err == sql.ErrNoRows {
        return "", fmt.Errorf("no follower relationship found")
    }
    if err != nil {
        return "", fmt.Errorf("error querying follower status: %v", err)
    }
    
    return status, nil
}

func GetPendingFollowers(userID int) ([]int, error) {
	log.Printf("Getting followers for user %d", userID)

	rows, err := database.DB.Query(`
        SELECT follower_id 
        FROM followers 
        WHERE followed_id = ?`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("error querying followers: %v", err)
	}
	defer rows.Close()

	var followers []int
	for rows.Next() {
		var followerID int
		if err := rows.Scan(&followerID); err != nil {
			return nil, fmt.Errorf("error scanning follower data: %v", err)
		}
		followers = append(followers, followerID)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over followers: %v", err)
	}

	log.Printf("Retrieved %d followers successfully", len(followers))
	return followers, nil
}

func GetFollowed(userID int) ([]int, error) {
	log.Printf("Getting followed for user %d", userID)

	rows, err := database.DB.Query(`
        SELECT followed_id 
        FROM followers 
        WHERE follower_id = ?`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("error querying followed: %v", err)
	}
	defer rows.Close()

	var followed []int
	for rows.Next() {
		var followerID int
		if err := rows.Scan(&followerID); err != nil {
			return nil, fmt.Errorf("error scanning followed data: %v", err)
		}
		followed = append(followed, followerID)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over followed: %v", err)
	}

	log.Printf("Retrieved %d followed successfully", len(followed))
	return followed, nil
}

func HandleFollowRequest(followerID, followedID int, action string) error {
	log.Printf("Handling follow request: follower=%d, followed=%d, action=%s",
		followerID, followedID, action)

	if err := validateRequest(followerID, followedID, action); err != nil {
		return err
	}

	tx, err := database.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	if err := verifyPendingRequest(tx, followerID, followedID); err != nil {
		return err
	}

	if err := executeAction(tx, followerID, followedID, action); err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	log.Printf("Successfully %sed follow request", action)
	return nil
}

func validateRequest(followerID, followedID int, action string) error {
	if followerID == followedID {
		return fmt.Errorf("invalid operation: cannot handle self-follow")
	}
	if action != "accept" && action != "reject" {
		return fmt.Errorf("invalid action: must be 'accept' or 'reject'")
	}
	return nil
}

func verifyPendingRequest(tx *sql.Tx, followerID, followedID int) error {
	var status string
	err := tx.QueryRow(`
		SELECT status 
		FROM followers 
		WHERE follower_id = ? AND followed_id = ?`,
		followerID, followedID,
	).Scan(&status)

	if err == sql.ErrNoRows {
		return fmt.Errorf("no follow request found")
	}
	if err != nil {
		return fmt.Errorf("error checking follow request: %v", err)
	}
	if status != "pending" {
		return fmt.Errorf("can only handle pending follow requests, current status: %s", status)
	}
	return nil
}

func executeAction(tx *sql.Tx, followerID, followedID int, action string) error {
	var query string
	if action == "accept" {
		query = `UPDATE followers 
			SET status = 'accepted'
			WHERE follower_id = ? AND followed_id = ? AND status = 'pending'`
	} else {
		query = `DELETE FROM followers
			WHERE follower_id = ? AND followed_id = ? AND status = 'pending'`
	}

	result, err := tx.Exec(query, followerID, followedID)
	if err != nil {
		return fmt.Errorf("error %sing follow request: %v", action, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking affected rows: %v", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("no pending follow request found")
	}
	return nil
}
