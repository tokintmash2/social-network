package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"social-network/structs"
	"social-network/utils"
	"time"
)

func SignupHandler(w http.ResponseWriter, r *http.Request) {

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	var newUser structs.User

	newUser.Email = r.FormValue("email")
	newUser.Password = r.FormValue("password")
	newUser.FirstName = r.FormValue("firstName")
	newUser.LastName = r.FormValue("lastName")
	newUser.Username = r.FormValue("username")
	newUser.AboutMe = r.FormValue("about")

	// Parse the date of birth
	dobStr := r.FormValue("dob")
	dob, err := time.Parse("2006-01-02", dobStr)
	if err != nil {
		http.Error(w, "Invalid date of birth", http.StatusBadRequest)
		return
	}
	newUser.DOB = dob

	// Parse the avatar
	file, fileHeader, err := r.FormFile("avatar")
	if err == nil && file != nil {
		defer file.Close()

		// Generate unique filename
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), fileHeader.Filename)

		// Create uploads directory if it doesn't exist
		uploadDir := "backend/avatars"
		os.MkdirAll(uploadDir, 0755)

		// Create new file
		dst, err := os.Create(filepath.Join(uploadDir, filename))
		if err != nil {
			http.Error(w, "Failed to save avatar", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		// Copy uploaded file to destination
		_, err = io.Copy(dst, file)
		if err != nil {
			http.Error(w, "Failed to save avatar", http.StatusInternalServerError)
			return
		}

		// Save filename to user record
		newUser.Avatar = filename
	} 

	// json.NewDecoder(r.Body).Decode(&newUser)

	// Create the new user
	userID, err := utils.CreateUser(newUser)
	// Set the newly generated user ID
	newUser.ID = userID
	log.Println("New user:", newUser)
	if err == nil {
		sessionUUID, err := utils.CreateSession(newUser.ID)
		if err != nil {
			http.Error(w, "Failed to create a session", http.StatusInternalServerError)
			return
		}
		cookie := utils.CreateSessionCookie(sessionUUID)
		http.SetCookie(w, cookie)
		json.NewEncoder(w).Encode(map[string]bool{"success": true})
	} else {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": err.Error()})
	}
}

// func SignupHandler(w http.ResponseWriter, r *http.Request) {

// 	var newUser structs.User

// 	json.NewDecoder(r.Body).Decode(&newUser)

// 	// Create the new user
// 	userID, err := utils.CreateUser(newUser)
// 	// Set the newly generated user ID
// 	newUser.ID = userID
// 	log.Println("New user:", newUser)
// 	if err == nil {
// 		sessionUUID, err := utils.CreateSession(newUser.ID)
// 		if err != nil {
// 			http.Error(w, "Failed to create a session", http.StatusInternalServerError)
// 			return
// 		}
// 		cookie := utils.CreateSessionCookie(sessionUUID)
// 		http.SetCookie(w, cookie)
// 		json.NewEncoder(w).Encode(map[string]bool{"success": true})
// 	} else {
// 		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": err.Error()})
// 	}
// }
