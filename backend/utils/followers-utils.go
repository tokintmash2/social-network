package utils

import (
	"log"
	"social-network/database"
)

func AddFollower(followerID, followedID int) error {
	log.Println("AddFollower called")
	log.Println("followerID: ", followerID)
	log.Println("followingID: ", followedID)
	_, err := database.DB.Exec(`
        INSERT INTO followers (follower_id, followed_id)
        VALUES (?, ?)`,
		followerID, followedID,
	)
	if err != nil {
		log.Println("erroro adding follower: ", err)
	}
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
func GetFollowers(userID int) ([]int, error) {
	rows, err := database.DB.Query(`
        SELECT follower_id FROM followers
        WHERE followed_id = ?`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var followers []int
	for rows.Next() {
		var followerID int
		if err := rows.Scan(&followerID); err != nil {
			return nil, err
		}
		followers = append(followers, followerID)
	}
	return followers, nil
}
