package handlers

import "net/http"

func RunHandlers(r *http.ServeMux) {
	r.HandleFunc("/login", LoginHandler)
	r.HandleFunc("/register", SignupHandler)
	r.HandleFunc("/create-post", CreatePostHandler) // Maybe need to be changed
	r.HandleFunc("/ws", HandleConnections)
}
