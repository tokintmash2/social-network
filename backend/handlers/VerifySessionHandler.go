package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/utils"
)

func VerifySessionHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session")
	if err != nil {
		response := map[string]interface{}{
			"success": false,
			"message": "No session found",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	sessionUUID := cookie.Value
	userID, validSession := utils.VerifySession(sessionUUID, "VerifySessionHandler")
	if !validSession {
		response := map[string]interface{}{
			"success": false,
			"message": "Invalid session",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := utils.GetUserProfile(userID)
	if err != nil {
		response := map[string]interface{}{
			"success": false,
			"message": "User not found",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"user":    user,
	}
	json.NewEncoder(w).Encode(response)
}
