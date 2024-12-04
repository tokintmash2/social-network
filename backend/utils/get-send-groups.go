package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"
	"time"
)



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

func GetGroupMembers(groupID int) ([]structs.MemberResponse, error) {

    var members []structs.MemberResponse

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

        member := structs.MemberResponse{
            ID:    userProfile.ID,
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
