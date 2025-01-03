package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"time"
)

func SignupHandler(w http.ResponseWriter, r *http.Request) {

	var newUser structs.User

	message := ""

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		message = fmt.Sprintf("Failed to parse form: %v", err)
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

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
		message = fmt.Sprintf("Invalid date of birth: %v", err)
		http.Error(w, "Invalid date of birth", http.StatusBadRequest)
		return
	}
	newUser.DOB = dob

	filename, err := utils.HandleFileUpload(r, "avatar", "uploads")
	if err != nil && err.Error() != "http: no such file" {
		message = fmt.Sprintf("Failed to handle avatar upload: %v", err)
		http.Error(w, "Failed to handle avatar upload", http.StatusInternalServerError)
		return
	}

	if filename != "" {
		newUser.Avatar = filename
	} else {
		newUser.Avatar = "default_avatar.jpg"
	}


	// Create the new user
	userID, err := utils.CreateUser(newUser)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		message = fmt.Sprintf("Error creating user: %v", err)
		if err.Error() == "UNIQUE constraint failed: users.email" {
			message = "Email already exists"
			http.Error(w, "Email already exists", http.StatusBadRequest)
			return
		}
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}
	// Set the newly generated user ID
	newUser.ID = userID
	log.Println("New user:", newUser)
	if err == nil {
		sessionUUID, err := utils.CreateSession(newUser.ID)
		if err != nil {
			message = fmt.Sprintf("Failed to create a session: %v", err)
			http.Error(w, "Failed to create a session", http.StatusInternalServerError)
			return
		}
		cookie := utils.CreateSessionCookie(sessionUUID)
		http.SetCookie(w, cookie)
		json.NewEncoder(w).Encode(map[string]bool{"success": true})
	} else {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": message})
	}
}
