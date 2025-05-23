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

	postUpdate := structs.PostResponse{}
	postPrivacyChangeResponse := structs.PostPrivacyChangeResponse{}

	postID, err := utils.FetchIdFromPath(r.URL.Path, 2)
	if err != nil {
		http.Error(w, "Error fetching post ID", http.StatusBadRequest)
		return
	}

	log.Println("UpdatePostHandler | Post ID in the handler:", postID)

	err = json.NewDecoder(r.Body).Decode(&postUpdate)
	if err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	postUpdate.Privacy = strings.ToLower(postUpdate.Privacy)

	if postUpdate.Privacy == "private" {
		postUpdate.AllowedUsers, _ = utils.GetFollowers(userID)
	}

	log.Printf("Received privacy update request - Post ID: %d, Privacy: %s, Allowed Users: %v", postID, postUpdate.Privacy, postUpdate.AllowedUsers)

	// if postUpdate.Privacy == "private" {
	// 	postUpdate.AllowedUsers, _ = utils.GetFollowers(userID)
	// } else if postUpdate.Privacy == "almost_private" {
	// 	allowedUsersStr := r.Form["allowed_users[]"]
	// 	postUpdate.AllowedUsers = make([]int, len(allowedUsersStr))
	// 	for i, userStr := range allowedUsersStr {
	// 		userID, err := strconv.Atoi(userStr)
	// 		if err != nil {
	// 			http.Error(w, "Invalid user ID format", http.StatusBadRequest)
	// 			return
	// 		}
	// 		postUpdate.AllowedUsers[i] = userID
	// 	}
	// }

	// utils.UpdatePost(postID, postUpdate)

	// utils.SetPostAccess(postID, userID, postUpdate.Privacy, postUpdate.AllowedUsers)
	updateErr := utils.UpdatePostAccess(postID, userID, postUpdate.Privacy, postUpdate.AllowedUsers)
	if updateErr != nil {
		http.Error(w, "Updates were unable to be made", http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"update":  postPrivacyChangeResponse,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return
}
