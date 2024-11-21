package handlers

import "net/http"

func RunHandlers(r *http.ServeMux) {
	r.HandleFunc("/login", LoginHandler)
	r.HandleFunc("/register", SignupHandler)
	r.HandleFunc("/users/", ProfileHandler)
	r.HandleFunc("/toggle-privacy", TogglePrivacyHandler)
	r.HandleFunc("/groups", GroupsHandler)
	r.HandleFunc("/group-members", GroupMembersHandler)
	r.HandleFunc("/posts", CreatePostHandler)
	r.HandleFunc("/group-posts", CreateGroupPostHandler)
	r.HandleFunc("/ws", HandleConnections)
}
