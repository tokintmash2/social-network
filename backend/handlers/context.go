// Context shares needed information between different Handler functions.

package handlers

import (
	"context"
	"net/http"
)

type contextKey string

const userContextkey = contextKey("user")

// Returns a new copy of the request with the provided UserID added to the context.
func (app *application) contextSetUser(r *http.Request, user int) *http.Request {
	ctx := context.WithValue(r.Context(), userContextkey, user)
	return r.WithContext(ctx)
}

// Retrieves the UserID from the request context.
func (app *application) contextGetUser(r *http.Request) int {
	user, ok := r.Context().Value(userContextkey).(int)
	if !ok {
		panic("Missing user value in request context")
	}
	return user
}
