package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"
	"strconv"
)

// getLastInsertedPostID retrieves the ID of the last inserted post
func GetLastInsertedPostID() (int, error) {
	var postID int
	err := database.DB.QueryRow("SELECT last_insert_rowid()").Scan(&postID)
	if err != nil {
		return 0, err
	}
	return postID, nil
}

// convertToIntSlice converts a string slice to an integer slice
func ConvertToIntSlice(strSlice []string) []int {
	intSlice := make([]int, len(strSlice))
	for i, str := range strSlice {
		num, err := strconv.Atoi(str)
		if err != nil {
			continue
		}
		intSlice[i] = num
	}
	return intSlice
}

func FetchPosts(userID int) ([]structs.Post, error) {
	var posts []structs.Post
	
	rows, err := database.DB.Query(`
        SELECT post_id, user_id, content, image, privacy_setting, timestamp 
        FROM posts 
        WHERE user_id = ?
        ORDER BY timestamp DESC`, userID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    for rows.Next() {
        var post structs.Post
        err := rows.Scan(
            &post.ID,
            &post.UserID,
            &post.Content,
            &post.Image,
            &post.Privacy,
            &post.CreatedAt,
        )
        if err != nil {
            return nil, err
        }
        posts = append(posts, post)
    }
    return posts, nil
}

func CreatePost(newPost structs.Post) error {

	log.Println("Got post:", newPost)
	
	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert post
	_, err = tx.Exec(`
        INSERT INTO posts (user_id, content, privacy_setting, image, timestamp)
        VALUES (?, ?, ?, ?, ?)`,
		newPost.UserID, newPost.Content, newPost.Privacy, newPost.Image, newPost.CreatedAt,
	)
	if err != nil {
		log.Printf("Error inserting post: %v\n", err)
		return err
	}

	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v\n", err)
		return err
	}

	return nil
}
func CreateGroupPost(newPost structs.Post) error {

	log.Println("Got group post:", newPost)
	
	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert post

	// Need to add provacy setting?
	_, err = tx.Exec(`
        INSERT INTO group_posts (group_id, user_id, content, image, timestamp)
        VALUES (?, ?, ?, ?, ?)`,
		newPost.GroupID, newPost.UserID, newPost.Content, newPost.Image, newPost.CreatedAt,
	)
	if err != nil {
		log.Printf("Error inserting post: %v\n", err)
		return err
	}

	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v\n", err)
		return err
	}

	return nil
}
