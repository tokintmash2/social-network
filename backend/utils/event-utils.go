package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"
	"time"
)

func GetAttendees(eventID int) []structs.PersonResponse {

	var attendees []structs.PersonResponse

	rows, err := database.DB.Query(`
	SELECT user_id
	FROM event_responses
	WHERE event_id = ? AND response = 'going'`, eventID)
	if err != nil {
		log.Println("Error fetching attendees:", err)
		return nil
	}
	defer rows.Close()

	for rows.Next() {
		var attendee structs.PersonResponse
		err := rows.Scan(
			&attendee.ID)
		if err != nil {
			log.Println("Error scanning attendee:", err)
			continue
		}

		attendeeProfile, err := GetUserProfile(attendee.ID)
		if err != nil {
			log.Println("Error fetching attendee profile:", err)
			continue
		}

		attendee.FirstName = attendeeProfile.Username
		attendee.LastName = attendeeProfile.Avatar

		attendees = append(attendees, attendee)
	}
	return attendees
}

func RSVPForEvent(eventID, userID int) error {

	log.Printf("Got RSVP by user %d for event %d\n", userID, eventID)

	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}

	result, err := tx.Exec(`
	INSERT INTO event_responses (event_id, user_id, response, responded_at)
		VALUES (?, ?, ?, ?)`,
		eventID, userID, "going", time.Now(),
	)

	log.Printf("Result: %v\n", result)

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

func UnRSVPForEvent(eventID int, userID int) error {
	log.Printf("Got UnRSVP by user %d for event %d:", userID, eventID)
	
	tx, err := database.DB.Begin()
	if err != nil {
		return err
	}

	result, err := tx.Exec(`
    DELETE FROM event_responses 
    WHERE event_id = ? AND user_id = ?`,
        eventID, userID,
    )

	log.Printf("Result: %v\n", result)

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
