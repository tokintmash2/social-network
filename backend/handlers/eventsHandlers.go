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

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	currentUserID, validSession := utils.VerifySession(sessionUUID, "CreateEventHandler")
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

	if title == "" || description == "" || dateTimeStr == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	dateTime, err := time.Parse("2006-01-02T15:04", dateTimeStr)
	if err != nil {
		http.Error(w, "Invalid date format", http.StatusBadRequest)
		return
	}

	event := &structs.Event{
		GroupID:     groupID,
		Title:       title,
		Description: description,
		DateTime:    dateTime,
		CreatedBy:   currentUserID,
	}

	// Create event and fetch the inserted event's ID
	eventID, err := utils.CreateEvent(event)
	if err != nil {
		log.Printf("Error creating event: %v", err)
		http.Error(w, "Failed to create event", http.StatusInternalServerError)
		return
	}
	event.EventID = eventID // Update event with the generated ID

	// Add group creator to attendees list
	err = utils.RSVPForEvent(eventID, currentUserID)
	if err != nil {
		log.Printf("Error adding group creator as attendee: %v", err)
		http.Error(w, "Failed to add group creator as attendee", http.StatusInternalServerError)
		return
	}

	// Notify group members about the new event
	members, err := utils.GetGroupMembers(groupID)
	if err != nil {
		http.Error(w, "Failed to fetch group members", http.StatusInternalServerError)
		return
	}

	log.Println("Members: ", members)

	notifyUsers := make([]int, len(members))
	for i, member := range members {
		notifyUsers[i] = member.ID
	}

	log.Println("UserIDs: ", notifyUsers)

	notification := &structs.Notification{
		Type:      "event_created",
		Message:   fmt.Sprintf("New group event: %s", event.Title),
		Timestamp: time.Now(),
		Read:      false,
	}

	// Fetch updated event details with attendees and author
	eventWithDetails := utils.FetchEvent(event.EventID)

	notifications, _ := utils.CreateNotification(notifyUsers, notification)
	for i := range notifications {
		notifications[i].Event = eventWithDetails
	}
	app.sendWSNotification(notifications)

	response := map[string]interface{}{
		"success": true,
		"event":   eventWithDetails,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
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
	log.Println("eventID", eventID)

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

	attendees := utils.GetAttendees(eventID)
	response := map[string]interface{}{
		"success":   true,
		"message":   message,
		"attendees": attendees,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
