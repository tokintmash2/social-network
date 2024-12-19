package handlers

import (
	"net/http"
)

func RunHandlers(r *http.ServeMux, app *application) {

	r.HandleFunc("/login", LoginHandler)
	r.HandleFunc("/register", SignupHandler)
	r.HandleFunc("/logout", LogoutHandler)
	// r.HandleFunc("/api/users/", ProfileHandler)
	r.HandleFunc("/api/users/", UsersRouter)
	r.HandleFunc("/api/followers/", FollowersHandler)
	r.HandleFunc("/api/followers/requests", FollowRequestHandler)
	r.HandleFunc("/api/verify-session", VerifySessionHandler)
	r.HandleFunc("/toggle-privacy", TogglePrivacyHandler)
	r.HandleFunc("GET /api/groups", app.FetchAllGroupsHandler)
	r.HandleFunc("POST /api/groups", app.CreateGroupHandler)
	r.HandleFunc("GET /api/groups/{id}", app.GroupDetailsHandler)
	r.HandleFunc("POST /api/groups/{group_id}/posts", app.GroupPostsHandler)
	r.HandleFunc("POST /api/groups/{group_id}/members/{user_id}", app.GroupMembersHandler)
	r.HandleFunc("PATCH /api/groups/{group_id}/members/{user_id}", app.GroupMembersHandler)
	r.HandleFunc("DELETE /api/groups/{group_id}/members/{user_id}", app.GroupMembersHandler)
	r.HandleFunc("POST /api/groups/{group_id}/events", app.CreateEventHandler)
	r.HandleFunc("GET /api/groups/{group_id}/events", app.FetchGroupEventsHandler) // Fetch all
	r.HandleFunc("GET /api/groups/{group_id}/events/{event_id}", app.FetchGroupEventHandler) // Fetch one
	r.HandleFunc("POST /api/groups/{group_id}/events/{event_id}/rsvp", app.RSVPEventHandler) 
	r.HandleFunc("DELETE /api/groups/{group_id}/events/{event_id}/rsvp", app.RSVPEventHandler)
	// r.HandleFunc("POST /api/groups/{id}/messages", app.GroupMessagesHandler)
	// r.HandleFunc("GET /api/notifications", app.FetchNotificationsHandler)

	r.HandleFunc("POST /api/posts", app.CreatePostHandler)
	r.HandleFunc("GET /api/posts", app.FetchPostsHandler)

	// r.HandleFunc("/api/posts", PostsHandler)
	r.HandleFunc("/api/posts/", PostDetailHandler)
	// r.HandleFunc("/group-posts", CreateGroupPostHandler)
	r.HandleFunc("GET /ws", app.WebSocketHandler)
	// r.Handle("/avatars/", http.StripPrefix("/avatars/", http.FileServer(http.Dir("./avatars"))))
	r.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

}
