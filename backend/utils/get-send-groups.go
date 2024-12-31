package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"
	"time"
)

func FetchGroupDetails(groupID int) (*structs.GroupResponse, error) {

	group := structs.GroupResponse{}

	err := database.DB.QueryRow(`
        SELECT g.group_id, g.group_name, g.creator_id, g.description, g.created_at
        FROM groups g
        WHERE g.group_id = ?`, groupID).Scan(
		&group.ID,
		&group.Name,
		&group.CreatorID,
		&group.Description,
		&group.CreatedAt)

	if err != nil {
		log.Printf("Error fetching group: %v", err)
		return nil, err
	}

	// Fetch group members
	// members, err := GetGroupMembers(group.ID)
	// if err != nil {
	//     log.Printf("Error fetching group members: %v", err)
	//     return nil, err
	// }
	// group.Members = members

	return &group, nil
}

func FetchUserGroups(userID int) ([]structs.GroupResponse, error) {

	var groups []structs.GroupResponse

	rows, err := database.DB.Query(`
        SELECT g.* 
        FROM groups g
        INNER JOIN group_memberships gm ON g.group_id = gm.group_id
        WHERE gm.user_id = ?`, userID)
	if err != nil {
		log.Printf("Error fetching groups: %v", err)
		// http.Error(w, "Error fetching groups", http.StatusInternalServerError)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var group structs.GroupResponse
		err := rows.Scan(
			&group.ID,
			&group.Name,
			&group.CreatorID,
			&group.Description,
			&group.CreatedAt)
		if err != nil {
			log.Printf("Database query error: %v", err)
			// http.Error(w, "Error fetching groups", http.StatusInternalServerError)
			return nil, err
		}
		group.Members, err = GetGroupMembers(group.ID)
		groups = append(groups, group)
		if err := rows.Err(); err != nil {
			log.Printf("Error iterating over group members: %v", err)
			// http.Error(w, "Error fetching groups", http.StatusInternalServerError)
			return nil, err
		}
	}
	return groups, nil
}

func FetchAllGroups() ([]structs.GroupResponse, error) {

	var groups []structs.GroupResponse

	rows, err := database.DB.Query(`
        SELECT g.group_id, g.group_name, g.creator_id, g.description, g.created_at
        FROM groups g`)
	if err != nil {
		log.Printf("Error fetching all groups: %v", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var group structs.GroupResponse
		err := rows.Scan(
			&group.ID,
			&group.Name,
			&group.CreatorID,
			&group.Description,
			&group.CreatedAt)
		if err != nil {
			log.Printf("Database query error: %v", err)
			return nil, err
		}
		group.Members, err = GetGroupMembers(group.ID)
		groups = append(groups, group)
	}

	return groups, nil
}

func AddGroupMember(groupID, userID, adminID int) error {
	_, err := database.DB.Exec(`
        INSERT INTO group_memberships (group_id, user_id, role, joined_at)
        VALUES (?, ?, 'pending', ?)`,
		groupID, userID, time.Now(),
	)
	if err != nil {
		log.Println("Error adding member:", err)
		return err
	}

	return nil
}

func RemoveGroupMember(groupID, userID int) error {
	_, err := database.DB.Exec(`
        DELETE FROM group_memberships
        WHERE group_id = ? AND user_id = ?`,
		groupID, userID,
	)
	if err != nil {
		log.Println("Error removing member:", err)
		return err
	}
	return nil
}

func GetGroupMembers(groupID int) ([]structs.PersonResponse, error) {

	var members []structs.PersonResponse

	rows, err := database.DB.Query(`
        SELECT u.id, gm.role
        FROM users u
        INNER JOIN group_memberships gm ON u.id = gm.user_id
        WHERE gm.group_id = ?`, groupID)
	if err != nil {
		log.Println("Error fetching group members:", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var userID int
		var role string
		err := rows.Scan(&userID, &role)
		if err != nil {
			log.Println("Error scanning group member:", err)
			return nil, err
		}

		userProfile, err := GetUserProfile(userID)
		if err != nil {
			log.Println("Error fetching user profile:", err)
			return nil, err
		}

		member := structs.PersonResponse{
			ID:        userProfile.ID,
			FirstName: userProfile.FirstName,
			LastName:  userProfile.LastName,
			Role:      role,
		}
		members = append(members, member)
	}

	if err := rows.Err(); err != nil {
		log.Println("Error iterating over group members:", err)
		return nil, err
	}
	return members, nil
}

func GetGroupPosts(groupID int) ([]structs.PostResponse, error) {

	posts := []structs.PostResponse{}

	rows, err := database.DB.Query(`
	SELECT gp.group_post_id, gp.user_id, gp.title, gp.content, gp.image, gp.timestamp,
		u.first_name, u.last_name
		FROM group_posts gp
		JOIN users u ON gp.user_id = u.id
		WHERE gp.group_id = ?
		ORDER BY gp.timestamp DESC`, groupID)
	if err != nil {
		log.Println("Error fetching group members:", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post structs.PostResponse
		err := rows.Scan(&post.ID, &post.Author.ID, &post.Title, &post.Content, &post.MediaURL, &post.CreatedAt,
			&post.Author.FirstName, &post.Author.LastName)
		if err != nil {
			log.Println("Error scanning post:", err)
			return nil, err
		}
		post.Comments, _ = GetGroupPostComments(post.ID)
		posts = append(posts, post)
	}
	if err := rows.Err(); err != nil {
		log.Println("Error iterating over group members:", err)
		return nil, err
	}

	return posts, nil
}

func GetGroupPostComments(postID int) ([]structs.CommentResponse, error) {
	var comments []structs.CommentResponse
	rows, err := database.DB.Query(`
        SELECT c.comment_id, c.group_post_id, c.user_id, c.content, c.media_url, c.created_at,
               u.first_name, u.last_name
        FROM group_post_comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.group_post_id = ?
        ORDER BY c.created_at DESC`, postID)
	if err != nil {
		log.Println("Error fetching group members:", err)
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var comment structs.CommentResponse
		err := rows.Scan(
			&comment.ID,
			&comment.PostID,
			&comment.UserID,
			&comment.Content,
			&comment.Image,
			&comment.CreatedAt,
			&comment.AuthorResponse.FirstName,
			&comment.AuthorResponse.LastName)
		if err != nil {
			log.Println("Error scanning comment:", err)
			return nil, err
		}
		comments = append(comments, comment)
		log.Println("Comment:", comment)
		if err := rows.Err(); err != nil {
			log.Println("Error iterating over group members:", err)
			return nil, err
		}
	}
	return comments, nil
}

func CreateGroup(group structs.Group) error {
	log.Println("Got group:", group)

	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert group
	result, err := tx.Exec(`
        INSERT INTO groups (group_name, description, creator_id, created_at)
        VALUES (?, ?, ?, ?)`,
		group.Name, group.Description, group.CreatorID, group.CreatedAt,
	)
	log.Printf("Insert result: %+v", result)
	if err != nil {
		log.Println("Error inserting group:", err)
		return err
	}

	// Get the newly created group ID
	groupID, err := result.LastInsertId()
	if err != nil {
		log.Println("Error getting last insert ID:", err)
		return err
	}

	// Add creator as admin member
	_, err = tx.Exec(`
        INSERT INTO group_memberships (group_id, user_id, role, joined_at)
        VALUES (?, ?, 'admin', ?)`,
		groupID, group.CreatorID, group.CreatedAt,
	)
	if err != nil {
		log.Println("Error adding creator as admin:", err)
		return err
	}

	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v\n", err)
		return err
	}
	return nil
}

func GetGroupAdmin(groupID int) (int, error) {
	var adminID int
	err := database.DB.QueryRow(`
        SELECT creator_id
        FROM groups
        WHERE group_id = ?`, groupID).Scan(&adminID)
	if err != nil {
		log.Println("Error fetching group admin:", err)
		return 0, err
	}
	return adminID, nil
}
