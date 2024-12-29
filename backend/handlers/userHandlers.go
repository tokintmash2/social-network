package handlers

import (
	"net/http"
)

func (app *application) UsersHandler(w http.ResponseWriter, r *http.Request) {
	userID := app.contextGetUser(r)

	users, err := app.users.GetUserList(userID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusOK, envelope{"users": users}, nil)
}
