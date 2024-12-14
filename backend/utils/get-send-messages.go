package utils

import (
	"fmt"
	"log"
	"social-network/database"
	"social-network/structs"
	"time"
)

// Save messages to database
func SaveMessage(m structs.Message) (structs.Message, error) {

	log.Println("MSG:", m)

	tx, err := database.DB.Begin()
	if err != nil {
		log.Println("database error:", err)
		return structs.Message{}, err
	}
	defer tx.Rollback()

	// Insert message

	// TODO: get save message new id
	_, err = tx.Exec(`
        INSERT INTO messages (sender_id, receiver_id, content, timestamp)
        VALUES (?, ?, ?, ?)`,
		m.Sender, m.Recipient, m.Content, m.CreatedAt,
	)
	if err != nil {
		log.Printf("Error inserting message: %v\n", err)
		return structs.Message{}, err
	}

	err = tx.Commit()

	// TODO: fetch full message joined data by new id

	if err != nil {
		log.Printf("Error committing transaction: %v\n", err)
		return structs.Message{}, err
	}
	log.Println("Message successfully saved to the database")

	return m, nil
}

func GetRecentMessages(user, partner int, time time.Time) []structs.Message {

	log.Println("Getting recent messages older than:", time)
	log.Println("user:", user)
	log.Println("partner:", partner)

	// Modify the SQL query to include the timestamp condition
	rows, err := database.DB.Query(`
    SELECT m.sender_id, m.receiver_id, m.message, m.sent_at,
           s.username AS sender_username, r.username AS receiver_username
    FROM chats m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.receiver_id = r.id
    WHERE ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
      AND m.sent_at < ?
    ORDER BY m.sent_at DESC 
    LIMIT 10;`,
		user, partner, partner, user, time)

	if err != nil {
		log.Println("error getting recent messages", err)
	}
	defer rows.Close()

	var recentMessages []structs.Message
	for rows.Next() {
		var msg structs.Message
		msg.Type = "conversation"

		if err := rows.Scan(
			&msg.Sender, &msg.Recipient, &msg.Content, &msg.CreatedAt,
			&msg.SenderUsername, &msg.RecipientUsername,
		); err != nil {
			log.Println("error scanning recent messages", err)
		}
		recentMessages = append(recentMessages, msg)
	}

	fmt.Println("Recent messages:", recentMessages)
	return recentMessages
}
