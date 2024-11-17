package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"time"
)

// CreatePostHandler manages post creation functionality
func CreatePostHandler(writer http.ResponseWriter, request *http.Request) {

	log.Println("CreatePostHandler called")

	cookie, err := request.Cookie("session")
	if err != nil {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	userID, validSession := utils.VerifySession(sessionUUID, "CreatePostHandler")
	if !validSession {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	if request.Method == http.MethodPost {
		var post structs.Post

		err := json.NewDecoder(request.Body).Decode(&post)
		if err != nil {
			http.Error(writer, "Invalid JSON payload", http.StatusBadRequest)
			return
		}

		if post.Privacy == "" || post.Content == "" {
			http.Error(writer, "Content, Privacy setting cannot be empty", http.StatusBadRequest)
			return
		}

		log.Println("Post:", post) // testing

		post.UserID = userID
		post.CreatedAt = time.Now()

		err = utils.CreatePost(post)
		if err != nil {
			log.Printf("Error creating post: %v\n", err)
			http.Error(writer, "Error creating post", http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"success": true,
		}

		writer.Header().Set("Content-Type", "application/json")
		json.NewEncoder(writer).Encode(response)
		return
	}

	http.Error(writer, "Invalid request method", http.StatusMethodNotAllowed)
}

func CreateGroupPostHandler(writer http.ResponseWriter, request *http.Request) {

	log.Println("CreateGroupPostHandler called")

	cookie, err := request.Cookie("session")
	if err != nil {
		http.Redirect(writer, request, "/login", http.StatusSeeOther) // Needs to reviewed
		return
	}

	sessionUUID := cookie.Value
	userID, validSession := utils.VerifySession(sessionUUID, "CreatePostHandler")
	if !validSession {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return
	}

	if request.Method == http.MethodPost {
		var post structs.Post

		err := json.NewDecoder(request.Body).Decode(&post)
		if err != nil {
			http.Error(writer, "Invalid JSON payload", http.StatusBadRequest)
			return
		}

		if post.Privacy == "" || post.Content == "" || post.GroupID == 0 {
		// if post.Content == "" || post.GroupID == 0 {
			http.Error(writer, "Content, Privacy or Group ID setting cannot be empty", http.StatusBadRequest)
			return
		}

		log.Println("Post:", post) // testing

		post.UserID = userID
		post.CreatedAt = time.Now()

		err = utils.CreateGroupPost(post)
		if err != nil {
			log.Printf("Error creating post: %v\n", err)
			http.Error(writer, "Error creating post", http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"success": true,
		}

		writer.Header().Set("Content-Type", "application/json")
		json.NewEncoder(writer).Encode(response)
		return
	}

	http.Error(writer, "Invalid request method", http.StatusMethodNotAllowed)
}
