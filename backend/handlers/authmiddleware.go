package handlers

import (
	"log/slog"
	"net/http"

	"social-network/utils"
)

var ANON_USER int

func (app *application) authenticate(next http.HandlerFunc, redirect bool) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			app.logger.Error("Error getting session cookie:", slog.Any("err", err))
			if redirect {
				http.Redirect(w, r, "/login", http.StatusSeeOther)
			} else {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
			}
			return
		}

		sessionUUID := cookie.Value
		userID, validSession := utils.VerifySession(sessionUUID, "CreatePostHandler")
		if !validSession {
			app.logger.Error("Invalid session:", slog.Any("sessionUUID", sessionUUID))
			if redirect {
				http.Redirect(w, r, "/login", http.StatusSeeOther)
			} else {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
			}
			return
		}
		r = app.contextSetUser(r, userID)

		next.ServeHTTP(w, r)
	})
}

// Anonymous user (id 0) are considered not authenticated.
func (app *application) IsAuthenticated(r *http.Request) bool {
	return app.contextGetUser(r) != ANON_USER
}
