package handlers

import (
	"database/sql"
	"net/http"
)

type UserModel struct {
	DB *sql.DB
}

func (app *application) UsersHandler(w http.ResponseWriter, r *http.Request) {
	userID := app.contextGetUser(r)

	users, err := app.users.GetUserList(userID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusOK, envelope{"users": users}, nil)
}
