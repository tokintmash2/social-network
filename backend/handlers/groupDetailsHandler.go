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

func GroupDetailsRouter(w http.ResponseWriter, r *http.Request) {

	log.Println("GroupDetailsRouter called")

	cookie, err := r.Cookie("session")
	log.Println("Cookie:", cookie)
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	CurrentUserID, validSession := utils.VerifySession(sessionUUID, "GroupDetailsRouter")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/groups/")
	pathParts := strings.Split(path, "/")

	// GET
	if r.Method == http.MethodGet {
		if len(pathParts) < 2 {
			// Handle /api/groups/:id
			GroupDetailsHandler(w, r)
			return
		}
	}
	
	// POST etc
	if r.Method != http.MethodGet {
		groupID, _ := strconv.Atoi(pathParts[0])
		switch pathParts[1] {
		case "posts":
			// /api/groups/:id/posts/
			GroupPostsHandler(w, r, CurrentUserID, groupID)
		case "messages":
			GroupMessagesHandler(w, r, groupID)
		case "members":
			GroupMembersHandler(w, r, groupID)
		default:
			http.NotFound(w, r)
		}
	}
}

func GroupDetailsHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("GroupDetailsHandler called")

	groupID, err := utils.FetchIdFromPath(r.URL.Path, 2)
	if err != nil {
		log.Printf("Error fetching group ID: %v", err)
		http.Error(w, "Error fetching group ID", http.StatusBadRequest)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	group, err := utils.FetchGroupDetails(groupID)
	if err != nil {
		log.Printf("Error fetching group details: %v", err)
		http.Error(w, "Error fetching group details", http.StatusInternalServerError)
		return
	}

	group.Members, err = utils.GetGroupMembers(groupID)
	if err != nil {
		log.Printf("Error fetching group members: %v", err)
		http.Error(w, "Error fetching group members", http.StatusInternalServerError)
		return
	}

	group.GroupPosts, err = utils.GetGroupPosts(groupID)
	if err != nil {
		log.Printf("Error fetching group posts: %v", err)
		http.Error(w, "Error fetching group posts", http.StatusInternalServerError)
		return
	}

	if group == nil {
		http.Error(w, "Group not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(group); err != nil {
		log.Printf("Error encoding group response: %v", err)
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}

func GroupPostsHandler(w http.ResponseWriter, r *http.Request, userID, groupID int) {

	log.Println("CreatePostHandler called")

	log.Println("User ID:", userID)
	log.Println("Group ID:", groupID)

	var post structs.PostResponse

	if strings.Contains(r.Header.Get("Content-Type"), "multipart/form-data") {
		err := r.ParseMultipartForm(10 << 20) // 10 MB max
		if err != nil {
			log.Printf("Failed to parse form: %v\n", err)
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		post.Title = r.FormValue("title")
		post.Content = r.FormValue("content")
		// post.Privacy = r.FormValue("privacy")

		// if post.Privacy == "private" {
		// 	post.AllowedUsers, _ = utils.GetFollowers(userID)
		// } else if post.Privacy == "almost_private" {
		// 	allowedUsersStr := r.Form["allowed_users[]"]
		// 	post.AllowedUsers = make([]int, len(allowedUsersStr))
		// 	for i, userStr := range allowedUsersStr {
		// 		userID, err := strconv.Atoi(userStr)
		// 		if err != nil {
		// 			http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		// 			return
		// 		}
		// 		post.AllowedUsers[i] = userID
		// 	}
		// }
		// log.Println("Allowed users arrive like this:", post.AllowedUsers)

		// Handle file upload if present
		_, _, err = r.FormFile("image")
		if err == nil {
			filename, err := utils.HandleFileUpload(r, "image", "uploads")
			if err != nil {
				http.Error(w, "Failed to handle file upload", http.StatusInternalServerError)
				return
			}
			post.MediaURL = &filename
		}
	} else {
		http.Error(w, "Unsupported content type", http.StatusUnsupportedMediaType)
		return
	}

	// if post.Privacy == "" || post.Content == "" {
	// 	http.Error(w, "Content and Privacy setting cannot be empty", http.StatusBadRequest)
	// 	return
	// }

	post.Author.ID = userID
	post.CreatedAt = time.Now()
	post.GroupID = groupID

	err := utils.CreateGroupPost(post)
	if err != nil {
		log.Printf("Error creating post in CreatePostHandler: %v\n", err)
		http.Error(w, "Error creating post", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"post":    post,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	return

}

func GroupMessagesHandler(w http.ResponseWriter, r *http.Request, groupID int) {
}
