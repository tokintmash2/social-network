package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/utils"
)

// Toggle user's privacy setting
// Calling the endpoint will toggle the current user's privacy setting
func TogglePrivacyHandler(writer http.ResponseWriter, request *http.Request) {

	log.Println("TogglePrivacyHandler called")

	cookie, err := request.Cookie("session")
	if err != nil {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	userID, validSession := utils.VerifySession(sessionUUID, "TogglePrivacyHandler")
	if !validSession {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	response := map[string]interface{}{}

	if request.Method == http.MethodGet {
		// Fetch user profile data
		err := utils.ToggleUserPrivacy(userID)
		if err != nil {
			response = map[string]interface{}{
				"success": false,
			}
			log.Println("Error switching user profile:", err)
			http.Error(writer, "Error switching user profile", http.StatusInternalServerError)
			return
		} else {
			response = map[string]interface{}{
				"success": true,
			}
		}

		writer.Header().Set("Content-Type", "application/json")
		json.NewEncoder(writer).Encode(response)
		return
	}

}
