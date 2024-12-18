package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/utils"
)

func UsersRouter(w http.ResponseWriter, r *http.Request) {

	log.Println("UsersRouter called")

	switch r.Method {
	case "GET":
		ProfileHandler(w, r)
	case "POST":
		AddFollowerHandler(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func AddFollowerHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("AddFollowerHandler called")

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	followerID, validSession := utils.VerifySession(sessionUUID, "AddFollowerHandler")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	log.Println("Path to be fetched: ", r.URL.Path)
	followedID, err := utils.FetchIdFromPath(r.URL.Path, 2)

	if err != nil {
		log.Printf("Error parsing user ID: %v\n", err)
	}

	err = utils.AddFollower(followerID, followedID)
	if err != nil {
		log.Printf("Error adding follower: %v\n", err)
		http.Error(w, "Error adding follower", http.StatusInternalServerError)
		return
	}

}

// Returns the user's profile data JSON
// If profile is public, returns full profile data
// If profile is private, returns only usernname
func ProfileHandler(writer http.ResponseWriter, request *http.Request) {
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
	userID, err := utils.FetchIdFromPath(request.URL.Path, 1)
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
