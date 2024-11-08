package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"time"
)

func LoginHandler2(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Login attempt!")

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
	var callback = make(map[string]string)
	// if success {
	sessionCookie := http.Cookie{
		Name:     "socialNetworkSession",
		Value:    "userCookie", // testing
		Expires:  time.Now().Add(time.Minute * 500),
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	}
	http.SetCookie(w, &sessionCookie)

	authCookie := http.Cookie{
		Name:     "socialNetworkAuth",
		Value:    "true",
		Expires:  time.Now().Add(time.Minute * 500),
		Path:     "/",
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	}
	http.SetCookie(w, &authCookie)
	callback["login"] = "success"
	callback["userid"] = "userId"
	callback["useravatar"] = "validators.ValidateUserAvatar(userId)"
	callback["useremail"] = "validators.ValidateUserEmailFromId(userId)"
	// } else {
	// 	callback["login"] = "fail"
	// 	callback["error"] = userCookie
	// }

	writeData, _ := json.Marshal(callback)
	// helpers.CheckErr("handleLogin", err)
	w.Write(writeData)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {

	var user structs.User

	// FOR TESTING ----------
	user.Password = "Password"
	user.Username = "User"
	user.Email = "User@email.com"
	user.Identifier = "User"
	// ----------------------

	json.NewDecoder(r.Body).Decode(&user)

	fmt.Printf("LoginHandler user: %+v\n", user)

	userID, verified := utils.VerifyUser(user)
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
		// userIDWS = userID
	} else {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": "Wrong email or password"})
	}
}
