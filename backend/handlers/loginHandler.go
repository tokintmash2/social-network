package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/structs"
	"social-network/utils"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {

	var user structs.User

	json.NewDecoder(r.Body).Decode(&user)

	fmt.Printf("LoginHandler user: %+v\n", user)

	userID, verified := utils.VerifyUser(user)

	if verified {

		err := utils.SetUserOnline(userID)
		if err != nil {
			http.Error(w, "Error setting user online", http.StatusInternalServerError)
			return
		}
		sessionUUID, err := utils.CreateSession(userID)
		if err != nil {
			http.Error(w, "Failed to create a session", http.StatusInternalServerError)
			return
		}
		cookie := utils.CreateSessionCookie(sessionUUID)
		http.SetCookie(w, cookie)
		json.NewEncoder(w).Encode(map[string]interface {
		}{"success": true,
			"sessionUUID": sessionUUID,
			"user_id":     userID})

	} else {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": "Wrong email or password"})
	}
}
