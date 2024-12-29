package models

import (
	"database/sql"
	"slices"
	"social-network/structs"
	"time"
)

type GroupModel struct {
	DB *sql.DB
}

type GroupMessage struct {
	MessageID        int    `json:"message_id"`
	GroupID          int    `json:"group_id"`
	UserID           int    `json:"user_id"`
	MessageTimestamp string `json:"sent_at"`
	Message          string `json:"message"`
}

func (g *GroupModel) GetGroupList(id int) ([]structs.Group, error) {

	query := `
	SELECT
		G.group_id,
		G.created_at,
		G.group_name 
	FROM
		group_memberships GM 
		JOIN groups G ON G.group_id = GM.group_id
	WHERE
		GM.user_id = ?
		AND GM."role" <> 'pending'
	`
	rows, err := g.DB.Query(query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []structs.Group

	for rows.Next() {
		var group structs.Group
		err = rows.Scan(
			&group.ID,
			&group.CreatedAt,
			&group.Name,
		)
		if err != nil {
			return nil, err
		}
		groups = append(groups, group)
	}
	return groups, nil
}

// Add group message to the database.
func (m *GroupModel) SaveMessage(senderID int, groupID int, message string) (GroupMessage, []int, error) {

	// Select conditions when user is active member in group
	row := m.DB.QueryRow(`
		SELECT
			CASE WHEN EXISTS (
				SELECT * FROM group_memberships
				WHERE user_id = ? AND group_id = ? AND "role" <> 'pending'
			) THEN TRUE ELSE FALSE END AS is_member
	`, senderID, groupID)

	var isMember int

	err := row.Scan(&isMember)
	if err != nil {
		return GroupMessage{}, nil, err
	}

	if isMember != 1 {
		return GroupMessage{}, nil, &ChatError{Message: "Not allowed to send message to this user!"}
	}

	// Insert message with current timestamp and prepares for execution.
	stmt, err := m.DB.Prepare(`
	INSERT INTO group_messages (
		sent_at,
		message,
		user_id,
		group_id
	) VALUES (CURRENT_TIMESTAMP, ?, ?, ?)
	RETURNING message_id`)
	if err != nil {
		return GroupMessage{}, nil, err
	}
	defer stmt.Close()

	// Executes the statement with give arguments.
	var newID int
	err = stmt.QueryRow(message, senderID, groupID).Scan(&newID)
	if err != nil {
		return GroupMessage{}, nil, err
	}

	row = m.DB.QueryRow(`
	SELECT
		message_id,
		group_id,
		user_id,
		message,
		sent_at
	FROM
		group_messages
	WHERE
		message_id = ?
	`, newID)

	var msg GroupMessage
	err = row.Scan(
		&msg.MessageID,
		&msg.GroupID,
		&msg.UserID,
		&msg.Message,
		&msg.MessageTimestamp,
	)
	if err != nil {
		return GroupMessage{}, nil, err
	}

	var notifyIDs []int
	// Query group active memeber list who to notify
	rows, err := m.DB.Query(`
	SELECT
		user_id
	FROM
		group_memberships
	WHERE
		group_id = ?
		AND "role" <> 'pending'
	`, groupID)
	for rows.Next() {
		var id int
		err := rows.Scan(&id)
		if err != nil {
			break
		}
		notifyIDs = append(notifyIDs, id)
	}

	return msg, notifyIDs, nil
}

func (m *GroupModel) GetGroupMessages(userID int, groupID int, timestr string, count int) ([]GroupMessage, error) {

	// Default check earlier than right now
	timeFilter := "datetime()"

	// Parse the ISO timestamp string into a time.Time object
	t, err := time.Parse(time.RFC3339, timestr)
	if err == nil {
		// Use incoming time as filter in correct format for TIMESTAMP sqlite type
		timeFilter = t.Format("2006-01-02 15:04:05")
	}

	query := `
	SELECT
		m.message_id,
		m.group_id,
		m.user_id,
		m.message,
		m.sent_at
	FROM
		group_messages m
	WHERE
		group_id = ?
		AND sent_at < ?
		AND EXISTS (
			SELECT 1
			FROM group_memberships gm
			WHERE gm.group_id = m.group_id
				AND gm.user_id = ?
				AND gm."role" <> 'pending'
		)
	ORDER BY
		sent_at DESC
	LIMIT ?
	`
	rows, err := m.DB.Query(query, groupID, timeFilter, userID, count)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var messages []GroupMessage

	for rows.Next() {
		var msg GroupMessage

		err := rows.Scan(
			&msg.MessageID,
			&msg.GroupID,
			&msg.UserID,
			&msg.Message,
			&msg.MessageTimestamp,
		)
		if err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	slices.Reverse(messages)
	return messages, nil
}
