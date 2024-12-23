package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"strconv"
	"strings"
	"time"
)

func (app *application) GroupMembersHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("GroupMembersHandler called")

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	currentUser, validSession := utils.VerifySession(sessionUUID, "GroupsHandler")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/groups/")
	pathParts := strings.Split(path, "/")
	groupID, _ := strconv.Atoi(pathParts[0])
	userIDtoProcess, _ := strconv.Atoi(pathParts[2])

	// userIDtoProcess, err := utils.FetchIdFromPath(r.URL.Path, 4)
	// if err != nil {
	// 	log.Printf("Error fetching user ID: %v", err)
	// 	http.Error(w, "Error fetching user ID", http.StatusBadRequest)
	// 	return
	// }

	adminID, err := utils.GetGroupAdmin(groupID)
	if err != nil {
		log.Printf("Error fetching admin ID: %v\n", err)
		http.Error(w, "Error fetching admin ID", http.StatusInternalServerError)
		return
	}

	message := ""

	if r.Method == http.MethodPost { // Add member

		// Check if user is already a member
		if utils.IsMemberInGroup(groupID, userIDtoProcess) {
			http.Error(w, "User is already a member of this group", http.StatusConflict)
			return
		}

		err = utils.AddGroupMember(groupID, userIDtoProcess, currentUser)
		if err != nil {
			log.Printf("Error adding member to group: %v\n", err)
			http.Error(w, "Error adding member to group", http.StatusInternalServerError)
			return
		}

		// Send notification to the user & admin

		// Notify admin for approval
		adminNotification := &structs.Notification{
			Users:     []int{adminID},
			Type:      "group_member_added",
			Message:   fmt.Sprintf("User %d wants to add user %d to group", currentUser, userIDtoProcess),
			Timestamp: time.Now(),
			Read:      false,
		}

		log.Println("Admin notification:", adminNotification)

		// Store notification
		utils.CreateNotification(adminNotification)
		
		// Send WS notification 
		app.sendWSNotification(adminID, "group_member_added", adminNotification.Message)

		// Notify added user that they're pending
		userNotification := &structs.Notification{
			Users:     []int{userIDtoProcess},
			Type:      "group_member_added",
			Message:   "Your group membership is pending admin approval",
			Timestamp: time.Now(),
			Read:      false,
		}

		// Store notification
		utils.CreateNotification(userNotification)
		
		// Send WS notification 
		app.sendWSNotification(userIDtoProcess, "group_member_added", userNotification.Message)

		message = "Member added successfully"
	}

	if r.Method == http.MethodPatch {
		// Check if the requesting user is an admin
		if !utils.IsGroupAdmin(groupID, currentUser) {
			http.Error(w, "Unauthorized: Only group admins can approve members", http.StatusForbidden)
			return
		}

		// Check if user exists and is in pending state
		if !utils.IsPendingMember(groupID, userIDtoProcess) {
			http.Error(w, "User is not in pending state", http.StatusConflict)
			return
		}

		// Update member status from pending to member
		err = utils.UpdateMemberStatus(groupID, userIDtoProcess, "member")
		if err != nil {
			log.Printf("Error updating member status: %v\n", err)
			http.Error(w, "Error updating member status", http.StatusInternalServerError)
			return
		}

		userNotification := &structs.Notification{
			Users:     []int{userIDtoProcess},
			Type:      "group_member_approved",
			Message:   fmt.Sprintf("You've been approved to group %d", groupID),
			Timestamp: time.Now(),
			Read:      false,
		}
		
		// Store & send notification
		utils.CreateNotification(userNotification)
		app.sendWSNotification(userIDtoProcess, "group_member_approved", userNotification.Message)

		message = "Member approved successfully"
	}

	if r.Method == http.MethodDelete { // Reject member/leave group

		if userIDtoProcess == currentUser || utils.IsGroupAdmin(groupID, currentUser) {
			// Check if user exists in group
			if !utils.IsMemberInGroup(groupID, userIDtoProcess) {
				http.Error(w, "User is not a member of this group", http.StatusConflict)
				return
			}

			// Check if user exists and is in pending state
			if utils.IsPendingMember(groupID, userIDtoProcess) {
				message = "Membership rejected"
			} else {
				message = "Member removed successfully"
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

	}

	response := map[string]interface{}{
		"success": true,
		"message": message,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return
}

func (app *application) sendWSNotification(userID int, notificationType string, message string) {
	wsMessage := map[string]interface{}{
        "response_to": "notification",
        "data": map[string]interface{}{
            "type":    notificationType,
            "message": message,
        },
    }

    data, err := json.Marshal(wsMessage)
    if err != nil {
        app.logger.Error(err.Error())
        return
    }

    go func() {
        app.hub.outgoing <- OutgoingMessage{
            userID: userID,
            data:   data,
        }
    }()
}
