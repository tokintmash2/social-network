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
		var newPost struct {
			// Title       string `json:"title"`
			Content     string `json:"content"`
			Privacy     string `json:"privacy"`
			// CategoryIDs []int  `json:"categoryIDs"`
		}

		err := json.NewDecoder(request.Body).Decode(&newPost)
		if err != nil {
			http.Error(writer, "Invalid JSON payload", http.StatusBadRequest)
			return
		}

		if newPost.Privacy == "" || newPost.Content == "" {
			http.Error(writer, "Content, Privacy setting cannot be empty", http.StatusBadRequest)
			return
		}

		post := structs.Post{
			UserID:    userID,
			Content:   "Test post",
			Privacy:   "public",
			Image:     "test.jpg",
			CreatedAt: time.Now(),
		}

		log.Println("Post:", post) // testing

		err = utils.CreatePost(newPost)
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
