package utils

import (
	"log"
	"social-network/database"
	"social-network/structs"
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
