package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/utils"
	"strconv"
)

func (app *application) FetchNotificationsHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("FetchNotificationsHandler called")

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	userID, validSession := utils.VerifySession(sessionUUID, "FetchAllGroupsHandler")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	notifications, err := utils.FetchNotifications(userID)
	if err != nil {
		http.Error(w, "Failed to fetch notifications", http.StatusInternalServerError)
		return
	}
	response := map[string]interface{}{
		"success":       true,
		"notifications": notifications,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

}

func (app *application) MarkNotificationHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("MarkNotificationAsReadHandler called")

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	_, validSession := utils.VerifySession(sessionUUID, "FetchAllGroupsHandler")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	notificationID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "Invalid notification", http.StatusInternalServerError)
		return
	}

	utils.MarkNotificationAsRead(notificationID)

	app.writeJSON(w, http.StatusOK, envelope{"status": "ok"}, nil)
}
