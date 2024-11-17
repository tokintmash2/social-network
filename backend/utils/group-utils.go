package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"
)

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

// func CreateGroup(group structs.Group) error {

// 	log.Println("Got group:", group)

// 	tx, err := database.DB.Begin()
// 	if err != nil {
// 		return err
// 	}
// 	defer tx.Rollback()

// 	// Insert group
// 	_, err = tx.Exec(`
// 	INSERT INTO groups (group_name, description, creator_id, created_at)
// 	VALUES (?, ?, ?, ?)`,
// 	group.Name, group.Description, group.CreatorID, group.CreatedAt,
// 	)
// 	if err != nil {
// 		log.Println("Error inserting group:", err)
// 		return err
// 	}
// 	if err = tx.Commit(); err != nil {
// 		log.Printf("Error committing transaction: %v\n", err)
// 		return err
// 	}

// 	return nil
// }
