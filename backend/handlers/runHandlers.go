package handlers

import (
	"net/http"
)

func RunHandlers(r *http.ServeMux, app *application) {

	r.HandleFunc("/login", LoginHandler)
	r.HandleFunc("/register", SignupHandler)
	r.HandleFunc("/logout", LogoutHandler)
	r.HandleFunc("/users/", ProfileHandler)
	// r.HandleFunc("/api/users/", UsersHandler)
	r.HandleFunc("/followers/", FollowersHandler)
	r.HandleFunc("/api/verify-session", VerifySessionHandler)
	r.HandleFunc("/toggle-privacy", TogglePrivacyHandler)
	r.HandleFunc("/api/groups", GroupsRouter)
	r.HandleFunc("/api/groups/", GroupDetailsRouter)
	// r.HandleFunc("/group-members", GroupMembersHandler)
	r.HandleFunc("/api/posts", PostsHandler)
	r.HandleFunc("/api/posts/", PostDetailHandler)
	// r.HandleFunc("/group-posts", CreateGroupPostHandler)
	r.HandleFunc("GET /ws", app.WebSocketHandler)
	// r.Handle("/avatars/", http.StripPrefix("/avatars/", http.FileServer(http.Dir("./avatars"))))
	r.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

}
