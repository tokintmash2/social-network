package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"strings"
)

func PostDetailHandler(w http.ResponseWriter, r *http.Request) {

	path := strings.Trim(r.URL.Path, "/")
	parts := strings.Split(path, "/")

	if len(parts) < 3 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case "GET":
		FetchPostDetailHandler(w, r)
	case "POST":
		CreateCommentHandler(w, r)
	case "PATCH":
		UpdatePostHandler(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func FetchPostDetailHandler(w http.ResponseWriter, r *http.Request) {

	postID, err := utils.FetchIdFromPath(r.URL.Path, 2)
	if err != nil {
		http.Error(w, "Error fetching post ID", http.StatusBadRequest)
		return
	}

	log.Println("Post ID in the handler:", postID)

	post, err := utils.FetchPostDetails(postID)
	// comments, err := utils.FetchComments(postID)
	if err != nil {
		http.Error(w, "Error fetching post details", http.StatusInternalServerError)
		return
	}

	// post.Comments = comments

	response := []*structs.PostResponse{post}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func UpdatePostHandler(w http.ResponseWriter, r *http.Request) {

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

	var postUpdate structs.PostResponse

	postID, err := utils.FetchIdFromPath(r.URL.Path, 2)
	if err != nil {
		http.Error(w, "Error fetching post ID", http.StatusBadRequest)
		return
	}

	err = json.NewDecoder(r.Body).Decode(&postUpdate)
	if err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	// utils.UpdatePost(postID, postUpdate)

	utils.SetPostAccess(postID, userID, postUpdate.Privacy, postUpdate.AllowedUsers)

	response := map[string]interface{}{
		"success": true,
		"message": "Post updated successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return
}
