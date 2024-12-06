package handlers

import (
	"log"
	"net/http"
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

	groupID,_ := strconv.Atoi(pathParts[0])
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
