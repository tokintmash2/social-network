package handlers

import (
	"net/http"
)

func RunHandlers(r *http.ServeMux, app *application) {

	r.HandleFunc("/login", LoginHandler)
	r.HandleFunc("/register", SignupHandler)
	r.HandleFunc("/logout", LogoutHandler)

	// r.HandleFunc("/api/users/", UsersRouter)
	r.HandleFunc("GET /api/users", app.ProfileHandler)
	r.HandleFunc("GET /api/users/{u_id}", app.ProfileHandler)
	r.HandleFunc("GET /api/users/{u_id}/followers", app.FetchFollowersHandler)
	r.HandleFunc("POST /api/users/{u_id}/followers/{f_id}", app.FollowersHandler)
	r.HandleFunc("PATCH /api/users/{u_id}/followers/{f_id}", app.FollowersHandler)
	r.HandleFunc("DELETE /api/users/{u_id}/followers/{f_id}", app.RemoveFollowerHandler)
	// r.HandleFunc("/api/followers/", FollowersHandler)
	// r.HandleFunc("/api/followers/requests", FollowRequestHandler)

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
	r.HandleFunc("GET /api/groups/{group_id}/events", app.FetchGroupEventsHandler)           // Fetch all
	r.HandleFunc("GET /api/groups/{group_id}/events/{event_id}", app.FetchGroupEventHandler) // Fetch one
	r.HandleFunc("POST /api/groups/{group_id}/events/{event_id}/rsvp", app.RSVPEventHandler)
	r.HandleFunc("DELETE /api/groups/{group_id}/events/{event_id}/rsvp", app.RSVPEventHandler)
	// r.HandleFunc("POST /api/groups/{id}/messages", app.GroupMessagesHandler)

	r.HandleFunc("GET /api/notifications", app.FetchNotificationsHandler) // Fetch all user notifications
	r.HandleFunc("PATCH /api/notifications/{id}", app.MarkNotificationHandler)

	//r.HandleFunc("GET /api/chat", app.ListChatRoomsHandler)
	r.HandleFunc("GET /api/chat/{id}", app.authenticate(app.ListChatHandler, false))
	r.HandleFunc("POST /api/chat", app.authenticate(app.SaveChatHandler, false))
	r.HandleFunc("GET /api/chat/users", app.authenticate(app.UsersHandler, true))

	// r.HandleFunc("GET /api/groupchat/{id}", app.authenticate(app.ListGroupChatHandler, false))
	// r.HandleFunc("POST /api/chat", app.authenticate(app.SaveChatHandler, false))
	// r.HandleFunc("GET /api/chat/users", app.authenticate(app.UsersHandler, true))

	r.HandleFunc("POST /api/posts", app.CreatePostHandler)
	r.HandleFunc("GET /api/posts", app.FetchPostsHandler)

	r.HandleFunc("/api/posts/", PostDetailHandler)
	// r.HandleFunc("/group-posts", CreateGroupPostHandler)
	r.HandleFunc("GET /ws", app.authenticate(app.WebSocketHandler, false))

	// r.Handle("/avatars/", http.StripPrefix("/avatars/", http.FileServer(http.Dir("./avatars"))))
	r.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

}
