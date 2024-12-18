package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"
)

func CreateEvent(event *structs.Event) error {

	log.Println("Got event:", event)

	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}

	result, err := tx.Exec(`
	INSERT INTO events (group_id, title, description, date_time, created_by)
		VALUES (?, ?, ?, ?, ?)`,
		event.GroupID, event.Title, event.Description, event.DateTime, event.CreatedBy,
	)
	log.Printf("Insert result: %+v", result)
	if err != nil {
		log.Println("Error inserting group:", err)
		return err
	}

	if err = tx.Commit(); err != nil {
		log.Printf("Error committing transaction: %v\n", err)
		return err
	}

	return nil
}
