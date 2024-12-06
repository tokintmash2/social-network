package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"
)

func CreateComment(newComment structs.CommentResponse) error {
	log.Println("Got comment:", newComment)

	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(`
	INSERT INTO comments (post_id, user_id, content, media_url, created_at)
	VALUES (?, ?, ?, ?, ?)
	`, newComment.PostID, newComment.UserID, newComment.Content, newComment.Image, newComment.CreatedAt)
	if err != nil {
		log.Printf("Error inserting comment: %v\n", err)
		return err
	}

	if err = tx.Commit(); err != nil {
        log.Printf("Error committing transaction: %v\n", err)
        return err
    }
	
	return nil
}

func FetchComments(postID int) ([]structs.CommentResponse, error) {

	log.Println("FetchComments called with postID:", postID)

	var comments []structs.CommentResponse

	// log.Println("Created emtpy comments slice. Starting to fetch comments...")

	rows, err := database.DB.Query(`
		SELECT 
		c.comment_id,
		c.post_id,
		c.content,
		c.media_url,
		c.created_at,
		c.user_id,
		u.id,
		u.first_name,
		u.last_name
			FROM comments c
			JOIN users u ON c.user_id = u.id
			WHERE c.post_id = ?
			ORDER BY c.created_at DESC
		`, postID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	log.Println("Rows fetched. Starting to append comments to slice...")

	for rows.Next() {
		// log.Println("Scanning row...")
		var comment structs.CommentResponse
		err := rows.Scan(
			&comment.ID,
			&comment.PostID,
			&comment.Content,
			&comment.Image,
			&comment.CreatedAt,
			&comment.UserID,
			&comment.AuthorResponse.ID,
			&comment.AuthorResponse.FirstName,
			&comment.AuthorResponse.LastName,
		)

		if err != nil {
			log.Printf("Error scanning row: %v\n", err)
			return nil, err
		}

		// log.Println("Appending comment to slice.")
		comments = append(comments, comment)
	}

	return comments, err
}
