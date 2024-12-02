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
