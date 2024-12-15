package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/utils"
)

func GroupMembersHandler(w http.ResponseWriter, r *http.Request, groupID int) {

	log.Println("GroupMembersHandler called")

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	adminID, validSession := utils.VerifySession(sessionUUID, "GroupsHandler")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	userIDtoProcess, err := utils.FetchIdFromPath(r.URL.Path, 4)
	if err != nil {
		log.Printf("Error fetching user ID: %v", err)
		http.Error(w, "Error fetching user ID", http.StatusBadRequest)
		return
	}

	message := ""

	// TODO: Add PATCH method ("pending" -> "member")

	if r.Method == http.MethodPost { // Add member

		// Check if the requesting user is an admin
		if !utils.IsGroupAdmin(groupID, adminID) {
			http.Error(w, "Unauthorized: Only group admins can add members", http.StatusForbidden)
			return
		}

		// Check if user is already a member
		if utils.IsMemberInGroup(groupID, userIDtoProcess) {
			http.Error(w, "User is already a member of this group", http.StatusConflict)
			return
		}

		err = utils.AddGroupMember(groupID, userIDtoProcess, adminID)
		if err != nil {
			log.Printf("Error creating group: %v\n", err)
			http.Error(w, "Error creating group", http.StatusInternalServerError)
			return
		}

		message = "Member added successfully"
	}

	if r.Method == http.MethodDelete { // Remove member/leave group

		if userIDtoProcess == adminID || utils.IsGroupAdmin(groupID, adminID) {
			// Check if user exists in group
			if !utils.IsMemberInGroup(groupID, userIDtoProcess) {
				http.Error(w, "User is not a member of this group", http.StatusConflict)
				return
			}

			// Prevent admin from being removed
			if utils.IsGroupAdmin(groupID, userIDtoProcess) {
				http.Error(w, "Cannot remove group admin", http.StatusConflict)
				return
			}

			// Remove member
			err = utils.RemoveGroupMember(groupID, userIDtoProcess)
			if err != nil {
				log.Printf("Error removing member: %v\n", err)
				http.Error(w, "Error removing member", http.StatusInternalServerError)
				return
			}
		} else {
			http.Error(w, "Unauthorized: Only group admins can remove other members", http.StatusForbidden)
			return
		}

		message = "Member removed successfully"
	}

	response := map[string]interface{}{
		"success": true,
		"message": message,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return
}
