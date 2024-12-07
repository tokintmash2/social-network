package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/utils"
	"strconv"
	"strings"
)

func GroupDetailsRouter(w http.ResponseWriter, r *http.Request) {

	log.Println("GroupDetailsRouter called")

	path := strings.TrimPrefix(r.URL.Path, "/api/groups/")
	pathParts := strings.Split(path, "/")

	if len(pathParts) < 2 {
		// Handle /api/groups/:id
		GroupDetailsHandler(w, r)
		return
	}

	groupID, _ := strconv.Atoi(pathParts[0])
	switch pathParts[1] {
	case "join":
		GroupJoinHandler(w, r, groupID)
	case "leave":
		GroupLeaveHandler(w, r, groupID)
	case "posts":
		GroupPostsHandler(w, r, groupID)
	case "messages":
		GroupMessagesHandler(w, r, groupID)
	case "members":
		if len(pathParts) == 2 {
			// GroupMembersHandler(w, r, groupID)
		} else if len(pathParts) == 3 {
			memberID, _ := strconv.Atoi(pathParts[2])
			GroupMemberManagementHandler(w, r, groupID, memberID)
		}
	default:
		http.NotFound(w, r)
	}

}

func GroupDetailsHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("GroupDetailsHandler called")

	groupID, err := utils.FetchIdFromPath(r.URL.Path, 2)
	if err != nil {
		log.Printf("Error fetching group ID: %v", err)
		http.Error(w, "Error fetching group ID", http.StatusBadRequest)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	group, err := utils.FetchOneGroup(groupID)
	if err != nil {
		log.Printf("Error fetching group details: %v", err)
		http.Error(w, "Error fetching group details", http.StatusInternalServerError)
		return
	}

	if group == nil {
		http.Error(w, "Group not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(group); err != nil {
		log.Printf("Error encoding group response: %v", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}

}

func GroupJoinHandler(w http.ResponseWriter, r *http.Request, groupID int) {
}

func GroupLeaveHandler(w http.ResponseWriter, r *http.Request, groupID int) {
}

func GroupPostsHandler(w http.ResponseWriter, r *http.Request, groupID int) {
}

func GroupMessagesHandler(w http.ResponseWriter, r *http.Request, groupID int) {
}

func GroupMemberManagementHandler(w http.ResponseWriter, r *http.Request, groupID int, memberID int) {
}
