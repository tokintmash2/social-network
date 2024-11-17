package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/utils"
)

func GroupMembersHandler(writer http.ResponseWriter, request *http.Request) {

	log.Println("GroupsHandler called")

	cookie, err := request.Cookie("session")
	if err != nil {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	adminID, validSession := utils.VerifySession(sessionUUID, "GroupsHandler")
	if !validSession {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	if request.Method == http.MethodPost {
		var membership struct {
			GroupID int `json:"group_id"`
			UserID  int `json:"user_id"`
		}

		err := json.NewDecoder(request.Body).Decode(&membership)
		if err != nil {
			http.Error(writer, "Invalid JSON payload", http.StatusBadRequest)
			return
		}
	
		// Check if the requesting user is an admin
		if !utils.IsGroupAdmin(membership.GroupID, adminID) {
			http.Error(writer, "Unauthorized: Only group admins can add members", http.StatusForbidden)
			return
		}
	
		// Check if user is already a member
		if utils.IsMemberInGroup(membership.GroupID, membership.UserID) {
			http.Error(writer, "User is already a member of this group", http.StatusConflict)
			return
		}

		err = utils.AddGroupMember(membership.GroupID, membership.UserID, adminID)
		if err != nil {
			log.Printf("Error creating group: %v\n", err)
			http.Error(writer, "Error creating group", http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"success": true,
		}

		writer.Header().Set("Content-Type", "application/json")
		json.NewEncoder(writer).Encode(response)
		return
	}
}
