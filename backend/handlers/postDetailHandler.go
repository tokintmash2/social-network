package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/utils"
	"strconv"
)

func PostDetailHandler(w http.ResponseWriter, r *http.Request) {
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
	postID, _ := strconv.Atoi(r.URL.Query().Get("id"))

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
