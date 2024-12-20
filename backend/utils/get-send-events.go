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

func FetchGroupEvents(groupID int) []structs.Event {

	var events []structs.Event

	rows, err := database.DB.Query(`
	SELECT event_id, group_id, title, description, date_time, created_by
	FROM events
	WHERE group_id = ?
	ORDER BY date_time ASC`, groupID)
	if err != nil {
		log.Println("Error fetching events:", err)
		return nil
	}
	defer rows.Close()

	for rows.Next() {
		var event structs.Event
		err := rows.Scan(
			&event.EventID,
			&event.GroupID,
			&event.Title,
			&event.Description,
			&event.DateTime,
			&event.CreatedBy)
		if err != nil {
			log.Println("Error scanning event:", err)
			continue
		}

		authorProfile, err := GetUserProfile(event.CreatedBy)
		if err != nil {
			log.Println("Error fetching event author profile:", err)
			continue
		}

		event.Author = structs.PersonResponse{
			ID:        authorProfile.ID,
			FirstName: authorProfile.FirstName,
			LastName:  authorProfile.LastName,
		}

		event.Attendees = GetAttendees(event.EventID)

		events = append(events, event)
	}
	return events
}

func FetchEvent(eventID int) structs.Event {

	var event structs.Event

	rows, err := database.DB.Query(`
	SELECT event_id, group_id, title, description, date_time, created_by
	FROM events
	WHERE event_id = ?
	ORDER BY date_time ASC`, eventID)
	if err != nil {
		log.Println("Error fetching events:", err)
		return event
	}
	defer rows.Close()

	for rows.Next() {
		// var event structs.Event
		err := rows.Scan(
			&event.EventID,
			&event.GroupID,
			&event.Title,
			&event.Description,
			&event.DateTime,
			&event.CreatedBy)
		if err != nil {
			log.Println("Error scanning event:", err)
			continue
		}

		authorProfile, err := GetUserProfile(event.CreatedBy)
		if err != nil {
			log.Println("Error fetching event author profile:", err)
			continue
		}

		event.Author = structs.PersonResponse{
			ID:        authorProfile.ID,
			FirstName: authorProfile.Username,
			LastName:  authorProfile.Avatar,
		}

		event.Attendees = GetAttendees(event.EventID)

	}
	return event
}
