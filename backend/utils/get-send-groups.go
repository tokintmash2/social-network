package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"
	"time"
)

func FetchOneGroup(groupID int) (*structs.GroupResponse, error) {

	group := structs.GroupResponse{}
	println("Fetching group with ID:", groupID)

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
	members, err := GetGroupMembers(group.ID)
	if err != nil {
		log.Printf("Error fetching group members: %v", err)
		return nil, err
	}
	group.Members = members

	return &group, nil
}

func FetchAllGroups(userID int) ([]structs.GroupResponse, error) {

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

func AddGroupMember(groupID, userID, adminID int) error {
	_, err := database.DB.Exec(`
        INSERT INTO group_memberships (group_id, user_id, role, joined_at)
        VALUES (?, ?, 'member', ?)`,
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

func IsGroupAdmin(groupID, userID int) bool {
	var exists bool
	err := database.DB.QueryRow(`
        SELECT EXISTS (
            SELECT 1 FROM group_memberships 
            WHERE group_id = ? AND user_id = ? AND role = 'admin'
        )`, groupID, userID).Scan(&exists)

	if err != nil {
		log.Printf("Error checking admin status: %v\n", err)
		return false
	}
	return exists
}

func IsMemberInGroup(groupID, userID int) bool {
	var exists bool
	err := database.DB.QueryRow(`
        SELECT EXISTS (
            SELECT 1 FROM group_memberships 
            WHERE group_id = ? AND user_id = ?
        )`, groupID, userID).Scan(&exists)

	if err != nil {
		log.Printf("Error checking membership: %v\n", err)
		return false
	}
	return exists
}

func GetGroupMembers(groupID int) ([]structs.PersonResponse, error) {

	var members []structs.PersonResponse

	rows, err := database.DB.Query(`
        SELECT u.id
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
		err := rows.Scan(&userID)
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
		}
		members = append(members, member)
	}

	if err := rows.Err(); err != nil {
		log.Println("Error iterating over group members:", err)
		return nil, err
	}
	return members, nil
}

func CreateGroup(group structs.Group) (int64, error) {
	log.Println("Got group:", group)

	// Start a database transaction
	tx, err := database.DB.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	// Insert group into the database
	result, err := tx.Exec(`
        INSERT INTO groups (group_name, description, creator_id, created_at)
        VALUES (?, ?, ?, ?)`,
		group.Name, group.Description, group.CreatorID, group.CreatedAt,
	)
	log.Printf("Insert result: %+v", result)
	if err != nil {
		log.Println("Error inserting group:", err)
		return 0, err
	}

	// Get the newly created group ID
	groupID, err := result.LastInsertId()
	if err != nil {
		log.Println("Error getting last insert ID:", err)
		return 0, err
	}
	log.Printf("New group ID: %d", groupID)

	// Add the creator as an admin member of the group
	_, err = tx.Exec(`
        INSERT INTO group_memberships (group_id, user_id, role, joined_at)
        VALUES (?, ?, 'admin', ?)`,
		groupID, group.CreatorID, group.CreatedAt,
	)
	if err != nil {
		log.Println("Error adding creator as admin:", err)
		return 0, err
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v\n", err)
		return 0, err
	}

	// Return the newly created group ID
	return groupID, nil
}
