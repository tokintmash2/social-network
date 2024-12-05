package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"strconv"
	"time"
)

func PostsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		FetchPostsHandler(w, r)
	case "POST":
		log.Println("Metheod is POST")
		CreatePostHandler(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// CreatePostHandler manages post creation functionality
func CreatePostHandler(writer http.ResponseWriter, request *http.Request) {

	log.Println("CreatePostHandler called")

	cookie, err := request.Cookie("session")
	log.Println("Cookie:", cookie)
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

		log.Println("var post:", post)

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

		filename, err := utils.HandleFileUpload(request, "image", "uploads")
		if err != nil {
			http.Error(writer, "Failed to handle file upload", http.StatusInternalServerError)
			return
		}

		post.UserID = userID
		post.CreatedAt = time.Now()
		post.Image = filename

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

func FetchPostsHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("FetchPostsHandler called")

	// CurrentUserID := r.Context().Value("userID").(int) // Authenticated user's ID

	// Parse query parameters
	queryParams := r.URL.Query()
	targetUserIDStr := queryParams.Get("user_id")       // Optional: Fetch posts by specific user
	privacyFilter := queryParams.Get("privacy_setting") // Optional: Filter by privacy setting
	// isFeed := queryParams.Get("feed") == "true"
	targetUserID, _ := strconv.Atoi(targetUserIDStr) // Convert string to int

	log.Println("targetUserID:", targetUserID) // testing)
	log.Println("queryParams:", queryParams)   // testing

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	CurrentUserID, validSession := utils.VerifySession(sessionUUID, "FetchPostsHandler")
	if !validSession && privacyFilter != "private" && CurrentUserID != targetUserID {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	posts, err := utils.FetchPosts(targetUserID)
	if err != nil {
		log.Printf("Error fetching posts: %v\n", err)
		http.Error(w, "Error fetching posts", http.StatusInternalServerError)
		return
	}

	if len(posts) == 0 {
		response := map[string]interface{}{
			"posts":   []structs.PostResponse{},
			"message": "No posts found",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	// response := map[string]interface{}{
	// 	"posts": posts,
	// }

	// response := []*structs.PostResponse{posts}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
	return
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
