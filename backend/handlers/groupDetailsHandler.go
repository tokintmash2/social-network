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

	cookie, err := r.Cookie("session")
	log.Println("Cookie:", cookie)
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	_, validSession := utils.VerifySession(sessionUUID, "CreatePostHandler")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/groups/")
	pathParts := strings.Split(path, "/")

	if len(pathParts) < 2 {
		// Handle /api/groups/:id
		GroupDetailsHandler(w, r)
		return
	}

	groupID, _ := strconv.Atoi(pathParts[0])
	switch pathParts[1] {
	case "posts":
		GroupPostsHandler(w, r, groupID)
	case "messages":
		GroupMessagesHandler(w, r, groupID)
	case "members":
		GroupMembersHandler(w, r, groupID)
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

	group, err := utils.FetchGroupDetails(groupID)
	if err != nil {
		log.Printf("Error fetching group details: %v", err)
		http.Error(w, "Error fetching group details", http.StatusInternalServerError)
		return
	}

	group.Members, err = utils.GetGroupMembers(groupID)
	if err != nil {
		log.Printf("Error fetching group members: %v", err)
		http.Error(w, "Error fetching group members", http.StatusInternalServerError)
		return
	}

	group.GroupPosts, err = utils.GetGroupPosts(groupID)
	if err != nil {
		log.Printf("Error fetching group posts: %v", err)
		http.Error(w, "Error fetching group posts", http.StatusInternalServerError)
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

func GroupPostsHandler(w http.ResponseWriter, r *http.Request, groupID int) {
}

func GroupMessagesHandler(w http.ResponseWriter, r *http.Request, groupID int) {
}
