package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"strconv"
	"strings"
	"time"
)

func (app *application) CreateEventHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("CreateEventHandler called")

	err := r.ParseMultipartForm(10 << 20) // 10 MB max memory
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	// var event structs.Event

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	currentUserID, validSession := utils.VerifySession(sessionUUID, "FetchAllGroupsHandler")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/groups/")
	pathParts := strings.Split(path, "/")
	groupID, _ := strconv.Atoi(pathParts[0])

	title := r.FormValue("title")
	description := r.FormValue("description")
	dateTimeStr := r.FormValue("date_time")

	dateTime, err := time.Parse("2006-01-02T15:04", dateTimeStr)
	if err != nil {
		http.Error(w, "Invalid date format", http.StatusBadRequest)
		return
	}

	if title == "" {
		http.Error(w, "Title is required. Cuz ya wanna be entitled", http.StatusBadRequest)
		return
	}

	event := &structs.Event{
		GroupID:     groupID,
		Title:       title,
		Description: description,
		DateTime:    dateTime,
		CreatedBy:   currentUserID,
	}

	utils.CreateEvent(event)

	// TODO: notify group members about the new event

	response := map[string]interface{}{
		"success": true,
		"post":    event,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return

}

func (app *application) FetchGroupEventsHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("FetchGroupEventsHandler called")

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

	path := strings.TrimPrefix(r.URL.Path, "/api/groups/")
	pathParts := strings.Split(path, "/")
	groupID, _ := strconv.Atoi(pathParts[0])

	events := utils.FetchGroupEvents(groupID)

	response := map[string]interface{}{
		"success": true,
		"events":  events,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
