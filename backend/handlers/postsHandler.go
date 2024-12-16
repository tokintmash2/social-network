package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"strconv"
	"strings"
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
		var post structs.PostResponse

		if strings.Contains(request.Header.Get("Content-Type"), "multipart/form-data") {
			err := request.ParseMultipartForm(10 << 20) // 10 MB max
			if err != nil {
				log.Printf("Failed to parse form: %v\n", err)
				http.Error(writer, "Failed to parse form", http.StatusBadRequest)
				return
			}

			post.Title = request.FormValue("title")
			post.Content = request.FormValue("content")
			post.Privacy = request.FormValue("privacy")

			if post.Privacy == "private" {
				post.AllowedUsers, _ = utils.GetFollowers(userID)
			} else if post.Privacy == "almost_private" {
				allowedUsersStr := request.Form["allowed_users[]"]
				post.AllowedUsers = make([]int, len(allowedUsersStr))
				for i, userStr := range allowedUsersStr {
					userID, err := strconv.Atoi(userStr)
					if err != nil {
						http.Error(writer, "Invalid user ID format", http.StatusBadRequest)
						return
					}
					post.AllowedUsers[i] = userID
				}
			}
			// log.Println("Allowed users arrive like this:", post.AllowedUsers)

			// Handle file upload if present
			_, _, err = request.FormFile("image")
			if err == nil {
				filename, err := utils.HandleFileUpload(request, "image", "uploads")
				if err != nil {
					http.Error(writer, "Failed to handle file upload", http.StatusInternalServerError)
					return
				}
				post.MediaURL = &filename
			}
		} else {
			http.Error(writer, "Unsupported content type", http.StatusUnsupportedMediaType)
			return
		}

		if post.Privacy == "" || post.Content == "" {
			http.Error(writer, "Content and Privacy setting cannot be empty", http.StatusBadRequest)
			return
		}

		post.Author.ID = userID
		post.CreatedAt = time.Now()

		err = utils.CreatePost(post)
		if err != nil {
			log.Printf("Error creating post in CreatePostHandler: %v\n", err)
			http.Error(writer, "Error creating post", http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"success": true,
			"post":    post,
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
		var post structs.PostResponse

		err := json.NewDecoder(request.Body).Decode(&post)
		if err != nil {
			http.Error(writer, "Invalid JSON payload", http.StatusBadRequest)
			return
		}

		log.Println("Post:", post) // testing

		post.Author.ID = userID
		post.CreatedAt = time.Now()

		response := map[string]interface{}{
			"success": true,
		}

		writer.Header().Set("Content-Type", "application/json")
		json.NewEncoder(writer).Encode(response)
		return
	}

	http.Error(writer, "Invalid request method", http.StatusMethodNotAllowed)
}
