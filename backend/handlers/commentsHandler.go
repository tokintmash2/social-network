package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"time"
)

func CreateCommentHandler(w http.ResponseWriter, r *http.Request) {

	log.Println("CreateCommentHandler called")

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

		var newComment structs.CommentResponse

		err := json.NewDecoder(r.Body).Decode(&newComment)

		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		log.Println("Comment:", newComment)

		filename, err := utils.HandleFileUpload(r, "image", "uploads")
		if err != nil {
			http.Error(w, "Failed to handle file upload", http.StatusInternalServerError)
			return
		}

		newComment.Image = &filename
		newComment.UserID = userID
		newComment.CreatedAt = time.Now()
		newComment.PostID, err = utils.FetchIdFromPath(r.URL.Path, 2)
		if err != nil {
			http.Error(w, "Error fetching post ID", http.StatusBadRequest)
			return
		}

		

		err = utils.CreateComment(newComment)
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
		newComment.AuthorResponse = structs.AuthorResponse{
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
