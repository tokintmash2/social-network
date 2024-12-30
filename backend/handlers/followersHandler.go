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
)

func FollowersHandler(writer http.ResponseWriter, request *http.Request) {
	var follower struct {
		FollowerID int `json:"user_id"`
		FollowedID int `json:"followed_id"`
	}

	path := request.URL.Path
	var err error
	follower.FollowedID, err = utils.FetchIdFromPath(path, 2)
	if err != nil {
		log.Printf("Error fetching ID from path: %v", err)
		http.Error(writer, "Invalid user ID", http.StatusBadRequest)
		return
	}

	log.Println("FollowedID:", follower.FollowedID)

	cookie, err := request.Cookie("session")
	if err != nil {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}
	var validSession bool
	sessionUUID := cookie.Value
	follower.FollowerID, validSession = utils.VerifySession(sessionUUID, "FollowersHandler")
	if !validSession {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	switch request.Method {
	case http.MethodPost:
		// Add a follower
		err := utils.AddFollower(follower.FollowerID, follower.FollowedID)
		if err != nil {
			http.Error(writer, "Error adding follower", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(writer).Encode(map[string]interface{}{
			"success": true,
			"message": "Follower added successfully",
		})

	case http.MethodGet:
		followers, err := utils.GetFollowers(follower.FollowedID)
		if err != nil {
			http.Error(writer, "Error getting followers", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(writer).Encode(map[string]interface{}{
			"success":   true,
			"followers": followers,
		})

	case http.MethodDelete:
		err := utils.RemoveFollower(follower.FollowerID, follower.FollowedID)
		if err != nil {
			log.Printf("Error in RemoveFollower: %v", err)

			if err.Error() == "no follower relationship found between users" {
				http.Error(writer, "Follower relationship not found", http.StatusNotFound)
				return
			}

			http.Error(writer, "Error removing follower", http.StatusInternalServerError)
			return
		}

		writer.Header().Set("Content-Type", "application/json")
		json.NewEncoder(writer).Encode(map[string]interface{}{
			"success": true,
			"message": "Follower removed successfully",
		})

	default:
		http.Error(writer, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func FollowRequestHandler(writer http.ResponseWriter, request *http.Request) {
	cookie, err := request.Cookie("session")
	if err != nil {
		http.Error(writer, "Unauthorized", http.StatusUnauthorized)
		return
	}

	sessionUUID := cookie.Value
	followedID, validSession := utils.VerifySession(sessionUUID, "FollowRequestHandler")
	if !validSession {
		http.Error(writer, "Invalid session", http.StatusUnauthorized)
		return
	}

	var requestData struct {
		FollowerID int    `json:"follower_id"`
		Action     string `json:"action"` // "accept" or "reject"
	}

	if err := json.NewDecoder(request.Body).Decode(&requestData); err != nil {
		http.Error(writer, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = utils.HandleFollowRequest(requestData.FollowerID, followedID, requestData.Action)
	if err != nil {
		switch {
		case strings.Contains(err.Error(), "invalid action"):
			http.Error(writer, err.Error(), http.StatusBadRequest)
		case strings.Contains(err.Error(), "no follow request found"):
			http.Error(writer, err.Error(), http.StatusNotFound)
		default:
			log.Printf("Error handling follow request: %v", err)
			http.Error(writer, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	json.NewEncoder(writer).Encode(map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Follow request %sed successfully", requestData.Action),
	})
}

func (app *application) FetchFollowersHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("FetchFollowersHandler called")

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
	userIDProcessed, _ := strconv.Atoi(pathParts[0])

	followersIDs, err := utils.GetFollowers(userIDProcessed)
	if err != nil {
		http.Error(w, "Error getting followers", http.StatusInternalServerError)
		return
	}

	followers := []structs.PersonResponse{}
	following := []structs.PersonResponse{}

	for _, followerID := range followersIDs {
		var followerName structs.PersonResponse
		followerProfile, err := utils.GetUserProfile(followerID)
		if err != nil {
			log.Printf("Error fetching follower: %v", err)
			continue
		}
		followerName.ID = followerProfile.ID
		followerName.FirstName = followerProfile.FirstName
		followerName.LastName = followerProfile.LastName
		followerName.Status,_ = utils.GetFollowStatus(userIDProcessed, followerID)

		followers = append(followers, followerName)
	}

	followedIDs, err := utils.GetFollowed(userIDProcessed)
	if err != nil {
		http.Error(w, "Error getting followed", http.StatusInternalServerError)
		return
	}

	for _, followedID := range followedIDs {
		var followedName structs.PersonResponse
		followedProfile, err := utils.GetUserProfile(followedID)
		if err != nil {
			log.Printf("Error fetching followed: %v", err)
			continue
		}
		followedName.ID = followedProfile.ID
		followedName.FirstName = followedProfile.FirstName
		followedName.LastName = followedProfile.LastName
		followedName.Status,_ = utils.GetFollowStatus(followedID, userIDProcessed)


		following = append(following, followedName)
	}

	response := map[string]interface{}{
		"success":   true,
		"followers": followers,
		"following": following,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return
}
