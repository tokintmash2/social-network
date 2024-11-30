package handlers

import (
	"net/http"
)

func RunHandlers(r *http.ServeMux) {

	// avatarPath, err := filepath.Abs("backend/avatars")
	// if err != nil {
	// 	panic("Could not resolve avatar directory path")
	// }

	// fmt.Println("Setting up file server for avatars at backend/avatars")
	// r.Handle("/avatars/", http.StripPrefix("/avatars/", http.FileServer(http.Dir(avatarPath))))

	r.HandleFunc("/login", LoginHandler)
	r.HandleFunc("/register", SignupHandler)
	r.HandleFunc("/logout", LogoutHandler)
	r.HandleFunc("/users/", ProfileHandler)
	// r.HandleFunc("/api/users/", UsersHandler)
	r.HandleFunc("/followers/", FollowersHandler)
	r.HandleFunc("/verify-session", VerifySessionHandler)
	r.HandleFunc("/toggle-privacy", TogglePrivacyHandler)
	r.HandleFunc("/groups", GroupsHandler)
	r.HandleFunc("/group-members", GroupMembersHandler)
	// r.HandleFunc("/posts", CreatePostHandler)
	r.HandleFunc("/api/posts", PostsHandler)
	r.HandleFunc("/api/posts/", PostDetailHandler)
	r.HandleFunc("/group-posts", CreateGroupPostHandler)
	r.HandleFunc("/ws", HandleConnections)
	r.Handle("/avatars/", http.StripPrefix("/avatars/", http.FileServer(http.Dir("./avatars"))))

}
