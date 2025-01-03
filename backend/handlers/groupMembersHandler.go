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
	currentUserID, validSession := utils.VerifySession(sessionUUID, "GroupsHandler")
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

		currentIsAdmin := currentUserID == adminID
		isSelfJoining := userIDtoProcess == currentUserID

		err = utils.AddGroupMember(groupID, userIDtoProcess, "pending")
		if err != nil {
			log.Printf("Error adding member to group: %v\n", err)
			http.Error(w, "Error adding member to group", http.StatusInternalServerError)
			return
		}

		groupDetails, _ := utils.FetchGroupDetails(groupID)
		userDetails, _ := utils.GetUserProfile(userIDtoProcess)
		currentUserDetails, _ := utils.GetUserProfile(currentUserID)

		// message goes to group admin
		message := fmt.Sprintf(
			"User %s wants to add user %s to group %s",
			currentUserDetails.GetFriendlyName(),
			userDetails.GetFriendlyName(),
			groupDetails.Name,
		)
		extra := fmt.Sprintf(`{"group_id":%d,"user_id":%d}`, groupID, userIDtoProcess)

		if currentIsAdmin {
			message = fmt.Sprintf(
				"You added user %s to group %s, they need to approve",
				userDetails.GetFriendlyName(),
				groupDetails.Name,
			)
			extra = ""
		}

		if isSelfJoining {
			message = fmt.Sprintf(
				"User %s wants to join your group %s",
				userDetails.GetFriendlyName(),
				groupDetails.Name,
			)
		}

		// Notify admin for approval
		notifyUsers := []int{adminID}
		adminNotification := &structs.Notification{
			Type:      "group_member_added",
			Message:   message,
			Timestamp: time.Now(),
			Read:      false,
			Extra:     extra,
		}

		log.Println("Admin notification:", adminNotification)

		// Store notification
		notifications, _ := utils.CreateNotification(notifyUsers, adminNotification)

		// Send WS notification
		app.sendWSNotification(notifications)

		message = fmt.Sprintf(
			"User %s wants to add you to group %s",
			currentUserDetails.GetFriendlyName(),
			groupDetails.Name,
		)
		extra = fmt.Sprintf(`{"group_id":%d,"user_id":%d}`, groupID, userIDtoProcess)

		if isSelfJoining {
			message = fmt.Sprintf(
				"Your group membership to %s is pending approval",
				groupDetails.Name,
			)
			extra = ""
		}

		// Notify added user that they're pending
		notifyUsers = []int{userIDtoProcess}
		userNotification := &structs.Notification{
			Type:      "group_member_added",
			Message:   message,
			Timestamp: time.Now(),
			Read:      false,
			Extra:     extra,
		}

		// Store notification
		notifications, _ = utils.CreateNotification(notifyUsers, userNotification)

		// Send WS notification
		app.sendWSNotification(notifications)

		message = "Member added successfully"
	}

	if r.Method == http.MethodPatch {
		// Check if the requesting user is an admin or is invited
		if !(userIDtoProcess == currentUserID || utils.IsGroupAdmin(groupID, currentUserID)) {
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
		groupDetails, _ := utils.FetchGroupDetails(groupID)
		notifyUsers := []int{userIDtoProcess}
		userNotification := &structs.Notification{
			Type:      "group_member_approved",
			Message:   fmt.Sprintf("You've been approved to group %s", groupDetails.Name),
			Timestamp: time.Now(),
			Read:      false,
		}

		// Store & send notification
		notification, _ := utils.CreateNotification(notifyUsers, userNotification)
		app.sendWSNotification(notification)

		message = "Member approved successfully"
	}

	if r.Method == http.MethodDelete { // Reject member/leave group

		if !(userIDtoProcess == currentUserID || utils.IsGroupAdmin(groupID, currentUserID)) {
			http.Error(w, "Unauthorized: Only group admins can remove other members", http.StatusForbidden)
			return
		}

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
	}

	response := map[string]interface{}{
		"success": true,
		"message": message,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return
}
