package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"
)

func FetchPostDetails(postID int) (*structs.PostResponse, error) {

	log.Println("FetchPostDetails called with postID:", postID)

	var post structs.PostResponse
	var author structs.PersonResponse

	err := database.DB.QueryRow(`
        SELECT 
            p.post_id,
			p.content,
			p.privacy_setting,
			p.timestamp, p.image,
            u.id,
			u.first_name,
			u.last_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.post_id = ?
    `, postID).Scan(&post.ID, &post.Content, &post.Privacy, &post.CreatedAt, &post.MediaURL,
		&author.ID, &author.FirstName, &author.LastName)
	if err != nil {
		log.Println("Error with query:", err)
		return nil, err
	}
	post.Author = author

	// Fetch allowed users for the post
	post.AllowedUsers, err = FetchAllowedUsers(postID)
	post.Comments, err = FetchComments(postID)
	if err != nil {
		log.Println("Error fetching allowed users:", err)
		return nil, err
	}

	log.Println("Fetched post:", post)

	return &post, nil
}

func FetchPosts(userID int) ([]structs.PostResponse, error) {

	log.Println("FetchPosts called with userID:", userID)

	var posts []structs.PostResponse

	rows, err := database.DB.Query(`
        SELECT post_id, user_id, title, content, image, privacy_setting, timestamp 
        FROM posts 
        WHERE user_id = ?
        ORDER BY timestamp DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		// var post structs.Post
		var post structs.PostResponse
		err := rows.Scan(
			&post.ID,
			&post.Author.ID,
			&post.Title,
			&post.Content,
			&post.MediaURL,
			&post.Privacy,
			&post.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		post.AllowedUsers, err = FetchAllowedUsers(post.ID)
		post.Comments, err = FetchComments(post.ID)
		if err != nil {
			log.Println("Error fetching allowed users for posts:", err)
			return nil, err
		}

		author, err := GetUserProfile(post.Author.ID)

		post.Author.ID = author.ID
		post.Author.FirstName = author.FirstName
		post.Author.LastName = author.LastName

		posts = append(posts, post)
	}
	return posts, nil
}

func CreatePost(newPost structs.PostResponse) (int64, error) {

	log.Println("Got post:", newPost)

	log.Printf("Starting database transaction for post creation")
	tx, err := database.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	// Insert post
	log.Println("Starting post insertion")
	result, err := tx.Exec(`
        INSERT INTO posts (user_id, title, content, privacy_setting, image, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)`,
		newPost.Author.ID, newPost.Title, newPost.Content, newPost.Privacy, newPost.MediaURL, newPost.CreatedAt,
	)
	if err != nil {
		log.Printf("Error inserting post in CreatePost(): %v\n", err)
		return 0, err
	} else {
		log.Printf("Post insertion successful")
	}

	postID, err := result.LastInsertId()
	if err != nil {
		log.Printf("Error getting post ID: %v\n", err)
		return 0, err
	}

	log.Println("Last inserted post ID:", postID)

	// var postresponse structs.PostResponse

	log.Println("Post privacy setting:", newPost.Privacy)

	log.Println("About to commit transaction")
	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v\n", err)
		return 0, err
	}

	// return nil
	log.Printf("About to set post access for postID: %d", postID)
	// return SetPostAccess(int(postID), newPost.Author.ID, newPost.Privacy, newPost.AllowedUsers)
	err = SetPostAccess(int(postID), newPost.Author.ID, newPost.Privacy, newPost.AllowedUsers)
	if err != nil {
		return 0, err
	}

	return postID, nil

}

func CreateGroupPost(newPost structs.PostResponse) error {

	log.Println("Got post:", newPost)

	log.Printf("Starting database transaction for post creation")
	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert post
	log.Println("Starting post insertion")
	result, err := tx.Exec(`
        INSERT INTO group_posts (group_id, user_id, title, content, image, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)`,
		newPost.GroupID, newPost.Author.ID, newPost.Title, newPost.Content, newPost.MediaURL, newPost.CreatedAt,
	)
	if err != nil {
		log.Printf("Error inserting post in CreatePost(): %v\n", err)
		return err
	} else {
		log.Printf("Post insertion successful")
	}

	postID, err := result.LastInsertId()
	if err != nil {
		log.Printf("Error getting post ID: %v\n", err)
		return err
	}

	log.Println("Last inserted post ID:", postID)

	log.Println("About to commit transaction")
	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v\n", err)
		return err
	}

	return nil

	// log.Printf("About to set post access for postID: %d", postID)
	// return SetPostAccess(int(postID), newPost.Author.ID, newPost.Privacy, newPost.AllowedUsers)
}
