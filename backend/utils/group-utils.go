package utils

import (
	"fmt"
	"log"
	"social-network/database"
)

func IsPendingMember(groupID, userID int) bool {
	var exists bool
	err := database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM group_memberships WHERE group_id = ? AND user_id = ? AND role = 'pending')",
		groupID, userID).Scan(&exists)
	if err != nil {
		log.Printf("Error checking pending member status: %v", err)
		return false
	}
	return exists
}

func UpdateMemberStatus(groupID, userID int, newRole string) error {
	_, err := database.DB.Exec("UPDATE group_memberships SET role = ? WHERE group_id = ? AND user_id = ?",
		newRole, groupID, userID)
	if err != nil {
		return fmt.Errorf("error updating member status: %v", err)
	}
	return nil
}
