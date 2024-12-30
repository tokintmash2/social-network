package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"strconv"
	"strings"
	"time"
)

// func UsersRouter(w http.ResponseWriter, r *http.Request) {

// 	log.Println("UsersRouter called")

// 	switch r.Method {
// 	case "GET":
// 		ProfileHandler(w, r)
// 	case "POST":
// 		AddFollowerHandler(w, r)
// 	default:
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 	}
// }

func (app *application) FollowersHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("AddFollowerHandler called")

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	_, validSession := utils.VerifySession(sessionUUID, "AddFollowerHandler")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/users/")
	pathParts := strings.Split(path, "/")
	followedID, _ := strconv.Atoi(pathParts[0])
	followerID, _ := strconv.Atoi(pathParts[2])

	if err != nil {
		log.Printf("Error parsing user ID: %v\n", err)
	}

	message := ""

	if r.Method == http.MethodPost {
		err = utils.AddFollower(followerID, followedID)
		if err != nil {
			log.Printf("Error adding follower: %v\n", err)
			http.Error(w, "Error adding follower", http.StatusInternalServerError)
			return
		}

		notifyUsers := []int{followedID}
		userNotification := &structs.Notification{
			Type:      "follow_request",
			Message:   "You have a new follow request!",
			Timestamp: time.Now(),
			Read:      false,
		}

		notifications, _ := utils.CreateNotification(notifyUsers, userNotification)
		app.sendWSNotification(notifications)

		message = "Followe request sent successfully"
	}

	if r.Method == http.MethodPatch {
		err := utils.HandleFollowRequest(followerID, followedID, "accept")
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		notifyUsers := []int{followedID}
		userNotification := &structs.Notification{
			Type:      "new_follower",
			Message:   "You have a new follower!",
			Timestamp: time.Now(),
			Read:      false,
		}

		notifications, _ := utils.CreateNotification(notifyUsers, userNotification)
		app.sendWSNotification(notifications)

		message = "Follower added successfully"
	}

	response := map[string]interface{}{
		"success": true,
		"message": message,
		// "message": "Follower added successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return

}
func (app *application) RemoveFollowerHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("RemoveFollowerHandler called")

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	_, validSession := utils.VerifySession(sessionUUID, "AddFollowerHandler")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/users/")
	pathParts := strings.Split(path, "/")
	followedID, _ := strconv.Atoi(pathParts[0])
	followerID, _ := strconv.Atoi(pathParts[2])

	if err != nil {
		log.Printf("Error parsing user ID: %v\n", err)
	}

	err = utils.RemoveFollower(followerID, followedID)
	if err != nil {
		log.Printf("Error adding follower: %v\n", err)
		http.Error(w, "Error adding follower", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Follower removed successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return

}

// Returns the user's profile data JSON
// If profile is public, returns full profile data
// If profile is private, returns only usernname
func (app *application) ProfileHandler(writer http.ResponseWriter, request *http.Request) {
	log.Println("ProfileHandler called")

	cookie, err := request.Cookie("session")
	if err != nil {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	_, validSession := utils.VerifySession(sessionUUID, "ProfileHandler")
	if !validSession {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	// Check if the request is for all users or a specific user
	userID, err := utils.FetchIdFromPath(request.URL.Path, 2)
	log.Println("userID", userID)
	if err != nil || userID == 0 {
		// No valid user ID in the path, return all users
		log.Println("Fetching all users...")
		users, err := utils.GetAllUsers()
		if err != nil {
			log.Printf("Error fetching all users: %v\n", err)
			http.Error(writer, "Error fetching users", http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"success": true,
			"users":   users,
		}

		writer.Header().Set("Content-Type", "application/json")
		json.NewEncoder(writer).Encode(response)
		return
	}

	// Fetch a specific user's profile
	log.Printf("Fetching profile for user ID: %d\n", userID)
	profile, err := utils.GetUserProfile(userID)
	if err != nil {
		log.Printf("Error fetching user profile: %v\n", err)
		http.Error(writer, "Error fetching user profile", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"profile": profile, // Entire profile object
	}

	writer.Header().Set("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(response)
}
