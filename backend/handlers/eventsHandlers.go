package handlers

import (
	"encoding/json"
	"fmt"
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

	// notify group members about the new event
	members, err := utils.GetGroupMembers(groupID) 
	if err != nil {
		http.Error(w, "Failed to fetch group members", http.StatusInternalServerError)
		return
	}

	userIDs := make([]int, len(members))
	for i, member := range members {
		userIDs[i] = member.ID
	}

	notification := &structs.Notification{
		Users:     userIDs,
		Type:      "event_created",
		Message:   fmt.Sprintf("New group event: %s", event.Title),
		Timestamp: time.Now(),
		Read:      false,
	}

	utils.CreateNotification(notification)

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

func (app *application) FetchGroupEventHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("FetchGroupEventHandler called")

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
	// groupID, _ := strconv.Atoi(pathParts[0])
	eventID, _ := strconv.Atoi(pathParts[2])

	log.Println("eventID: ", eventID)

	event := utils.FetchEvent(eventID)

	response := map[string]interface{}{
		"success": true,
		"events":  event,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (app *application) RSVPEventHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("RSVPEventHandler called")

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
	// groupID, _ := strconv.Atoi(pathParts[0])
	eventID, _ := strconv.Atoi(pathParts[2])

	message := ""

	if r.Method == "POST" {
		// Handle RSVP for an event
		utils.RSVPForEvent(eventID, currentUserID)
		message = fmt.Sprintf("RSVP for user %d successful", currentUserID)
	} else if r.Method == "DELETE" {
		// Handle RSVP cancellation for an event
		utils.UnRSVPForEvent(eventID, currentUserID)
		message = fmt.Sprintf("RSVP for user %d cancelled", currentUserID)
	}

	response := map[string]interface{}{
		"success": true,
		"message": message,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
