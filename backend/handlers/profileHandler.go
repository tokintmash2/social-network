package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/utils"
)

func ProfileHandler(writer http.ResponseWriter, request *http.Request) {
	log.Println("ProfileHandler called")

	// My profile & other user profile

	log.Println("ProfileHandler called")

	// var userID int

	cookie, err := request.Cookie("session")
	if err != nil {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	userID, validSession := utils.VerifySession(sessionUUID, "ProfileHandler")
	if !validSession {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	if request.Method == http.MethodGet {
		// Fetch user profile data
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
		return
	}

}
