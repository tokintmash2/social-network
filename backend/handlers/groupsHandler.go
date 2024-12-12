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

func GroupsRouter(w http.ResponseWriter, r *http.Request) {

	log.Println("GroupsHandler called")

	switch r.Method {
	case "GET":
		FetchAllGroupsHandler(w, r)
	case "POST":
		CreateGroupHandler(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func FetchAllGroupsHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("FetchAllGroups called")

	queryParams := r.URL.Query()
	targetUserIDStr := queryParams.Get("user_id")
	userID, _ := strconv.Atoi(targetUserIDStr)

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

	groups, err = utils.FetchAllGroups(userID)
	// rows, err := database.DB.Query(`
	//     SELECT g.*
	//     FROM groups g
	//     INNER JOIN group_memberships gm ON g.group_id = gm.group_id
	//     WHERE gm.user_id = ?`, userID)
	// if err != nil {
	// 	http.Error(w, "Error fetching groups", http.StatusInternalServerError)
	// 	return
	// }
	// defer rows.Close()

	// for rows.Next() {
	// 	var group structs.GroupResponse
	// 	err := rows.Scan(
	// 		&group.ID,
	// 		&group.Name,
	// 		&group.CreatorID,
	// 		&group.Description,
	// 		&group.CreatedAt)
	// 	if err != nil {
	// 		log.Printf("Database query error: %v", err)
	// 		http.Error(w, "Error fetching groups", http.StatusInternalServerError)
	// 		return
	// 	}
	// 	group.Members, err = utils.GetGroupMembers(group.ID)
	// 	groups = append(groups, group)
	// }
	// if err := rows.Err(); err != nil {
	// 	http.Error(w, "Error fetching groups", http.StatusInternalServerError)
	// 	return
	// }
	json.NewEncoder(w).Encode(groups)
	return
}

func CreateGroupHandler(w http.ResponseWriter, r *http.Request) {
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
	log.Printf("Received group data: %+v\n", group)
	if err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}
	if group.Name == "" || group.Description == "" {
		http.Error(w, "Group name or description cannot be empty", http.StatusBadRequest)
		return
	}

	group.CreatorID = userID
	group.CreatedAt = time.Now()

	log.Println("Group:", group)

	groupId, err := utils.CreateGroup(group)
	if err != nil {
		log.Printf("Error creating group: %v\n", err)
		http.Error(w, "Error creating group", http.StatusInternalServerError)
		return
	}

	// Get the newly created group
	createdGroup, err := utils.FetchOneGroup(int(groupId))
	if err != nil {
		log.Printf("Error fetching created group: %v\n", err)
		http.Error(w, "Error fetching created group", http.StatusInternalServerError)
		return
	}

	log.Println("Created group:", createdGroup)

	response := map[string]interface{}{
		"success": true,
		"message": "Group created successfully",
		"group":   createdGroup,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return

}
