package models

import (
	"database/sql"
	"slices"
)

type ChatMessage struct {
	ChatID           int    `json:"chat_id"`
	SenderID         int    `json:"sender_id"`
	SenderName       string `json:"sender_name"`
	ReceiverID       int    `json:"receiver_id"`
	ReceiverName     string `json:"receiver_name"`
	MessageTimestamp string `json:"sent_at"`
	Message          string `json:"message"`
}

type ChatRoom struct {
	SenderID             int    `json:"sender_id"`
	SenderName           string `json:"sender_name"`
	ReceiverID           int    `json:"receiver_id"`
	ReceiverName         string `json:"receiver_name"`
	LastMessageTimestamp string `json:"last_message_timestamp"`
}

type ChatModel struct {
	DB *sql.DB
}

// Get messages
func (m *ChatModel) GetUserMessages(senderID int, receiverID int, time string, count int) ([]ChatMessage, error) {
	if len(time) == 0 {
		time = "datetime()"
	}

	query := `
	SELECT
		c.chat_id,
		c.sent_at,
		c.message,
		c.sender_id,
		s.username AS sender_name,
		c.receiver_id,
		r.username AS receiver_name
	FROM
		chats c
		JOIN users s ON (c.sender_id = s.id)
		JOIN users r ON (c.receiver_id = r.id)
	WHERE
		((sender_id = ? AND receiver_id = ?)
		 OR (receiver_id = ? AND sender_id = ?))
		AND sent_at < ?
	ORDER BY
		sent_at DESC
	LIMIT ?
	`
	rows, err := m.DB.Query(query, senderID, receiverID, senderID, receiverID, time, count)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var messages []ChatMessage

	for rows.Next() {
		var m ChatMessage

		err := rows.Scan(
			&m.ChatID,
			&m.MessageTimestamp,
			&m.Message,
			&m.SenderID,
			&m.SenderName,
			&m.ReceiverID,
			&m.ReceiverName,
		)
		if err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	slices.Reverse(messages)
	return messages, nil
}

type ChatError struct {
	Message string
}

// Implement the error interface
func (e *ChatError) Error() string {
	return e.Message
}

// Add message to the database.
func (m *ChatModel) SaveMessage(senderID int, receiverID int, message string) (ChatMessage, error) {

	// Select conditions when user can chat with another user
	//  sender is following receiver
	//  or receiver is following sender
	// or receiver is public profile

	row := m.DB.QueryRow(`
		SELECT
 		COALESCE((SELECT true FROM followers WHERE follower_id = ? AND followed_id = ?), false) AS is_following,
 		COALESCE((SELECT true FROM followers WHERE followed_id = ? AND follower_id = ?), false) AS is_followed,
 		COALESCE((SELECT true FROM users WHERE id = ? AND is_public = true), false) AS is_public
	`, senderID, receiverID, senderID, receiverID, receiverID)

	var isFollowing int
	var isFollowed int
	var isPublic int

	err := row.Scan(&isFollowing, &isFollowed, &isPublic)
	if err != nil {
		return ChatMessage{}, err
	}

	if !(isFollowing == 1 || isFollowed == 1 || isPublic == 1) {
		return ChatMessage{}, &ChatError{Message: "Not allowed to send message to this user!"}
	}

	// Insert message with current timestamp and prepares for execution.
	stmt, err := m.DB.Prepare(`
	INSERT INTO chats (
		sent_at,
		message,
		sender_id,
		receiver_id
	) VALUES (CURRENT_TIMESTAMP, ?, ?, ?)
	RETURNING chat_id`)
	if err != nil {
		return ChatMessage{}, err
	}
	defer stmt.Close()

	// Executes the statement with give arguments.
	var newID int
	err = stmt.QueryRow(message, senderID, receiverID).Scan(&newID)
	if err != nil {
		return ChatMessage{}, err
	}

	row = m.DB.QueryRow(`
	SELECT
		c.chat_id,
		c.sent_at,
		c.message,
		c.sender_id,
		s.username AS sender_name,
		c.receiver_id,
		r.username AS receiver_name
	FROM
		chats c
		JOIN users s ON (c.sender_id = s.id)
		JOIN users r ON (c.receiver_id = r.id)
	WHERE
		c.chat_id = ?
	`, newID)

	var msg ChatMessage

	err = row.Scan(
		&msg.ChatID,
		&msg.MessageTimestamp,
		&msg.Message,
		&msg.SenderID,
		&msg.SenderName,
		&msg.ReceiverID,
		&msg.ReceiverName,
	)
	if err != nil {
		return ChatMessage{}, err
	}

	return msg, nil
}
