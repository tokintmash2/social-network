package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
)

func SignupHandler(w http.ResponseWriter, r *http.Request) {

	var newUser structs.User

	json.NewDecoder(r.Body).Decode(&newUser)

	// Create the new user
	userID, err := utils.CreateUser(newUser)
	// Set the newly generated user ID
	newUser.ID = userID
	log.Println("New user:", newUser)
	if err == nil {
		sessionUUID, err := utils.CreateSession(newUser.ID)
		if err != nil {
			http.Error(w, "Failed to create a session", http.StatusInternalServerError)
			return
		}
		cookie := utils.CreateSessionCookie(sessionUUID)
		http.SetCookie(w, cookie)
		json.NewEncoder(w).Encode(map[string]bool{"success": true})
	} else {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": err.Error()})
	}
}
