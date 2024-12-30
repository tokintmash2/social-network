package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"strings"
	"time"
)

func (app *application) GroupPostCommentHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("GroupPostCommentHandler called")
	log.Printf("Content-Type: %s\n", r.Header.Get("Content-Type"))

	groupID, err := utils.FetchIdFromPath(r.URL.Path, 2) // Position of group_id
	if err != nil {
		http.Error(w, "Error fetching group ID", http.StatusBadRequest)
		return
	}

	postID, err := utils.FetchIdFromPath(r.URL.Path, 4) // Position of post_id
	if err != nil {
		http.Error(w, "Error fetching post ID", http.StatusBadRequest)
		return
	}

	var newComment structs.CommentResponse

	if strings.Contains(r.Header.Get("Content-Type"), "multipart/form-data") {
		log.Println("Content-Type is multipart/form-data")
		err := r.ParseMultipartForm(10 << 20) // 10 MB max
		if err != nil {
			log.Printf("Failed to parse form: %v\n", err)
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		// Get content from form data
		newComment.Content = r.FormValue("content")
		log.Println("FormValue Content:", newComment.Content)

		// Handle file upload if present
		_, _, err = r.FormFile("image")
		if err == nil {
			filename, err := utils.HandleFileUpload(r, "image", "uploads")
			if err != nil {
				http.Error(w, "Failed to handle file upload", http.StatusInternalServerError)
				return
			}
			newComment.Image = &filename
		}
	} else {
		http.Error(w, "Unsupported content type", http.StatusUnsupportedMediaType)
		return
	}

	cookie, err := r.Cookie("session")
	log.Println("Cookie:", cookie)
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	sessionUUID := cookie.Value
	userID, validSession := utils.VerifySession(sessionUUID, "CreateCommentHandler")
	if !validSession {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	if r.Method == http.MethodPost {
		newComment.UserID = userID
		newComment.GroupID = groupID
		newComment.PostID = postID
		newComment.CreatedAt = time.Now()
		newComment.PostID, err = utils.FetchIdFromPath(r.URL.Path, 2)
		if err != nil {
			http.Error(w, "Error fetching post ID", http.StatusBadRequest)
			return
		}

		err = utils.CreateGroupPostComment(newComment)
		if err != nil {
			http.Error(w, "Error creating comment", http.StatusInternalServerError)
			return
		}

		newComment.ID, _ = utils.GetLastInsertedID()

		userProfile, err := utils.GetUserProfile(userID) // Get author data
		if err != nil {
			http.Error(w, "Error fetching author data", http.StatusInternalServerError)
			return
		}

		// Use only necessary fields from userProfile
		newComment.AuthorResponse = structs.PersonResponse{
			ID:        userProfile.ID,
			FirstName: userProfile.FirstName,
			LastName:  userProfile.LastName,
		}

		response := map[string]interface{}{
			"success": true,
			"comment": newComment,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}
}
