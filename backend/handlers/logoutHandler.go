package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/utils"
	"time"
)

// func LogoutHandler(w http.ResponseWriter, r *http.Request) {
// 	// Set JSON content type
// 	w.Header().Set("Content-Type", "application/json")

// 	// Check if method is POST
// 	if r.Method != http.MethodPost {
// 		w.WriteHeader(http.StatusMethodNotAllowed)
// 		json.NewEncoder(w).Encode(map[string]interface{}{
// 			"success": false,
// 			"message": "Method not allowed",
// 		})
// 		return
// 	}

// 	cookie, err := r.Cookie("session")
// 	if err != nil {
// 		http.Redirect(w, r, "/log-in", http.StatusSeeOther)
// 		return
// 	}

// 	existingSessionID := cookie.Value

// 	userID, validSession := utils.VerifySession(existingSessionID, "LogoutHandler")
// 	if !validSession {
// 		w.WriteHeader(http.StatusUnauthorized)
// 		json.NewEncoder(w).Encode(map[string]interface{}{
// 			"success": false,
// 			"message": "Unauthorized",
// 		})
// 		return
// 	}

// 	err = database.DB.QueryRow(`
//         SELECT session_uuid FROM sessions
//         WHERE user_id = ? AND expiry > CURRENT_TIMESTAMP`,
// 		userID,
// 	).Scan(&existingSessionID)

// 	if err == nil {
// 		err = utils.ClearSession(existingSessionID)
// 		if err != nil {
// 			w.WriteHeader(http.StatusInternalServerError)
// 			json.NewEncoder(w).Encode(map[string]interface{}{
// 				"success": false,
// 				"message": "Error clearing session",
// 			})
// 			return
// 		}
// 	}

// 	w.WriteHeader(http.StatusOK)
// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"success": true,
// 		"message": "Logged out successfully",
// 	})

// 	log.Printf("User %d logged out", userID)
// }

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get session cookie
	sessionCookie, err := r.Cookie("session")
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "No session found",
		})
		return
	}

	existingSessionID := sessionCookie.Value

	// Clear the session using the ID we got from cookie
	err = utils.ClearSession(existingSessionID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Error clearing session",
		})
		return
	}

	// Clear the cookie in the browser
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    "",
		Path:     "/",
		Expires:  time.Now().Add(-time.Hour), // Set to past time to expire it
		HttpOnly: true,
	})

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Logged out successfully",
	})
}

// func LogoutHandler(w http.ResponseWriter, r *http.Request) {

// 	var existingSessionID string
// 	var userID int
// 	err := database.DB.QueryRow(`
//         SELECT session_uuid FROM sessions
//         WHERE user_id = ? AND expiry > CURRENT_TIMESTAMP`,
// 		userID,
// 	).Scan(&existingSessionID)

// 	if err == nil {
// 		// If an active session exists, clear it before creating a new one
// 		err = utils.ClearSession(existingSessionID)
// 		if err != nil {
// 			return
// 		}
// 	}

// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"success": true,
// 		"message": "Logged out successfully"})

// 	log.Printf("User %d logged out", userID)
// }
