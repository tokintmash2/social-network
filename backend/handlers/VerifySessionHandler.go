package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/utils"
	"time"
)

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	User    interface{} `json:"user,omitempty"`
}

func VerifySessionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	cookie, err := r.Cookie("session")
	if err != nil {
		response := Response{
			Success: false,
			Message: "No session found",
		}

		// Clear the session cookie if it's not valid
		expiredCookie := &http.Cookie{
			Name:    "session",
			Value:   "",
			Path:    "/",
			Expires: time.Unix(0, 0), // Set to time in the past
			MaxAge:  -1,              // MaxAge<0 means delete cookie immediately
		}
		http.SetCookie(w, expiredCookie)

		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	sessionUUID := cookie.Value
	userID, validSession := utils.VerifySession(sessionUUID, "VerifySessionHandler")
	if !validSession {
		response := Response{
			Success: false,
			Message: "Invalid session",
		}
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := utils.GetUserProfile(userID)
	if err != nil {
		response := Response{
			Success: false,
			Message: "User not found",
		}
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := Response{
		Success: true,
		User:    user,
	}
	json.NewEncoder(w).Encode(response)
}
