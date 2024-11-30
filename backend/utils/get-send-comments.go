package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"
)

func FetchComments(postID int) ([]structs.CommentResponse, error) {

	log.Println("FetchComments called with postID:", postID)

	var comments []structs.CommentResponse

	// err := error(nil) // testing

	rows, err := database.DB.Query(`
	SELECT 
		c.comment_id,
		c.content,
		c.media_url,
		c.created_at,
		u.id,
		u.username,
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

	for rows.Next() {
		var comment structs.Comment
		err := rows.Scan(
			&comment.ID,
			&comment.Content,
			&comment.Image,
			&comment.CreatedAt,
			&comment.UserID,
			&comment.LastName,
		)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, err

}
