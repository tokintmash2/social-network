package handlers

import (
	"net/http"
)

func (app *application) UsersHandler(w http.ResponseWriter, r *http.Request) {

	// app.users.GetUserList()

	app.writeJSON(w, http.StatusOK, envelope{"users": nil}, nil)
}
