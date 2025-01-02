package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"strconv"
	"time"
)

// func GroupsRouter(w http.ResponseWriter, r *http.Request) {

// 	log.Println("GroupsHandler called")

// 	switch r.Method {
// 	case "GET":
// 		FetchAllGroupsHandler(w, r)
// 	case "POST":
// 		CreateGroupHandler(w, r)
// 	default:
// 		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
// 	}
// }

func (app *application) FetchAllGroupsHandler(w http.ResponseWriter, r *http.Request) {

	// endpoints:
	// /api/groups?user_id=1 to fetch all groups for a specific user
	// /api/groups to fetch all groups

	log.Println("FetchAllGroups called")

	var groups []structs.GroupResponse

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

	queryParams := r.URL.Query()
	targetUserIDStr := queryParams.Get("user_id")

	if targetUserIDStr == "" {
		groups, err = utils.FetchAllGroups()
	} else {
		userID, _ := strconv.Atoi(targetUserIDStr)
		groups, err = utils.FetchUserGroups(userID)
	}

	response := map[string]interface{}{
		"success": true,
		"groups":  groups,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return
}

func (app *application) CreateGroupHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("CreateGroupHandler called")

	var group structs.Group

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	userID, validSession := utils.VerifySession(sessionUUID, "CreateGroupsHandler")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	err = json.NewDecoder(r.Body).Decode(&group)
	if err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}
	if group.Name == "" || group.Description == "" {
		http.Error(w, "Group name or description cannot be empty", http.StatusBadRequest)
		return
	}

	log.Println("Group:", group) // testing

	group.CreatorID = userID
	group.CreatedAt = time.Now()

	err = utils.CreateGroup(group)
	if err != nil {
		log.Printf("Error creating group: %v\n", err)
		http.Error(w, "Error creating group", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Group created successfully",
		"group":   group,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return

}
