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

func LoginHandler(w http.ResponseWriter, r *http.Request) {

	// log.Println("LoginHandler called")

	var user structs.User

	json.NewDecoder(r.Body).Decode(&user)

	fmt.Printf("LoginHandler user: %+v\n", user)

	userID, verified := utils.VerifyUser(user)

	// Send test post
	testPost := structs.Post{
		UserID:    userID,
		Content:   "Test post",
		Privacy:   "public",
		Image:     "test.jpg",
		CreatedAt: time.Now(),
	}

	if verified {

		err := utils.SetUserOnline(userID)
		if err != nil {
			http.Error(w, "Error setting user online", http.StatusInternalServerError)
			return
		}
		sessionUUID, err := utils.CreateSession(userID)
		if err != nil {
			http.Error(w, "Failed to create a session", http.StatusInternalServerError)
			return
		}
		cookie := utils.CreateSessionCookie(sessionUUID)
		http.SetCookie(w, cookie)
		json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "sessionUUID": sessionUUID})

		utils.CreatePost(testPost) // Create a test post

	} else {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": "Wrong email or password"})
	}
}

// func LoginHandler2(w http.ResponseWriter, r *http.Request) {
// 	fmt.Println("Login attempt!")

// email := r.PostFormValue("email")
// password := r.PostFormValue("password")

// email := "User@email.com"
// password := "Asd"

// check user auth
// success, userCookie, userId := validators.ValidateUserLogin(email, password)
// var callback = make(map[string]string)
// if success {
// 	sessionCookie := http.Cookie{
// 		Name:     "socialNetworkSession",
// 		Value:    userCookie,
// 		Expires:  time.Now().Add(time.Minute * 500),
// 		Path:     "/",
// 		HttpOnly: true,
// 		SameSite: http.SameSiteNoneMode,
// 		Secure:   true,
// 	}
// 	http.SetCookie(w, &sessionCookie)

// 	authCookie := http.Cookie{
// 		Name:     "socialNetworkAuth",
// 		Value:    "true",
// 		Expires:  time.Now().Add(time.Minute * 500),
// 		Path:     "/",
// 		SameSite: http.SameSiteNoneMode,
// 		Secure:   true,
// 	}
// 	http.SetCookie(w, &authCookie)
// 	callback["login"] = "success"
// 	callback["userid"] = userId
// 	callback["useravatar"] = validators.ValidateUserAvatar(userId)
// 	callback["useremail"] = validators.ValidateUserEmailFromId(userId)
// } else {
// 	callback["login"] = "fail"
// 	callback["error"] = userCookie
// }

//-------------------

// success, userCookie, userId := validators.ValidateUserLogin(email, password)
// 	var callback = make(map[string]string)
// 	// if success {
// 	sessionCookie := http.Cookie{
// 		Name:     "socialNetworkSession",
// 		Value:    "userCookie", // testing
// 		Expires:  time.Now().Add(time.Minute * 500),
// 		Path:     "/",
// 		HttpOnly: true,
// 		SameSite: http.SameSiteNoneMode,
// 		Secure:   true,
// 	}
// 	http.SetCookie(w, &sessionCookie)

// 	authCookie := http.Cookie{
// 		Name:     "socialNetworkAuth",
// 		Value:    "true",
// 		Expires:  time.Now().Add(time.Minute * 500),
// 		Path:     "/",
// 		SameSite: http.SameSiteNoneMode,
// 		Secure:   true,
// 	}
// 	http.SetCookie(w, &authCookie)
// 	callback["login"] = "success"
// 	callback["userid"] = "userId"
// 	callback["useravatar"] = "validators.ValidateUserAvatar(userId)"
// 	callback["useremail"] = "validators.ValidateUserEmailFromId(userId)"
// 	// } else {
// 	// 	callback["login"] = "fail"
// 	// 	callback["error"] = userCookie
// 	// }

// 	writeData, _ := json.Marshal(callback)
// 	// helpers.CheckErr("handleLogin", err)
// 	w.Write(writeData)
// }
