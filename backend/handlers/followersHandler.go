package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/utils"
)

func FollowersHandler(writer http.ResponseWriter, request *http.Request) {

	var follower struct {
		FollowerID int `json:"user_id"`
		FollowedID int `json:"followed_id"`
	}

	path := request.URL.Path
	// log.Println("URL Path:", urlPath)
	// userIdStr := strings.TrimPrefix(urlPath, "/followers/")
	// follower.FollowedID, _ = strconv.Atoi(userIdStr)

	follower.FollowedID, _ = utils.FetchIdFromPath(path, 1)

	log.Println("ID:", follower.FollowedID)

	cookie, err := request.Cookie("session")
	if err != nil {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	var validSession bool

	sessionUUID := cookie.Value
	follower.FollowerID, validSession = utils.VerifySession(sessionUUID, "FollowersHandler")
	log.Println("FollowersHandler follower: ", follower)
	log.Println("FollowersHandler validSession: ", validSession)
	if !validSession {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	// err = json.NewDecoder(request.Body).Decode(&follower)
	// if err != nil {
	// 	http.Error(writer, "Invalid JSON payload", http.StatusBadRequest)
	// 	return
	// }

	log.Println("FollowersHandler follower: ", follower)

	if request.Method == http.MethodPost {
		// Add a follower
		err := utils.AddFollower(follower.FollowerID, follower.FollowedID)
		if err != nil {
			http.Error(writer, "Error adding follower", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(writer).Encode(map[string]interface {
		}{"success": true,
			"message": "Follower added successfully"})
	}
}
