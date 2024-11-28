package handlers

import (
	"encoding/json"
	"net/http"
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
	// case "PUT":
	// 	UpdatePostHandler(w, r)
	// case "DELETE":
	// 	DeletePostHandler(w, r)
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

	post, err := utils.FetchPostDetails(postID)
	if err != nil {
		http.Error(w, "Error fetching post details", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"post": post,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
