package handlers

import (
	"fmt"
	"net/http"
)

// Helper for logging and error message along with the current request method
// and URL as attributes in the log entry.
func (app *application) logError(r *http.Request, err error) {
	var (
		method = r.Method
		uri    = r.URL.RequestURI()
	)

	app.logger.Error(err.Error(), "method", method, "uri", uri)
}

// Helper for sending JSON-formatter error messages to the client
// with give status code.
// any type for message parameter gives more flexibility over the values
// that van be included in the response.
func (app *application) errorResponse(w http.ResponseWriter, r *http.Request, status int, message any) {
	env := envelope{"error": message}

	// If response returns an error then log it, and fall back to sending the client an empty response
	// with a status code 500 Internal Server Error.
	err := app.writeJSON(w, status, env, nil)
	if err != nil {
		app.logError(r, err)
		w.WriteHeader(500)
	}
}

// Is used when app encouters an unexpected problem at runtime.
// Sends out the 500 Internal Server Error and JSON response to the client.
func (app *application) serverErrorResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.logError(r, err)

	msg := "The server encountered a problem and couldn't process the request!"
	app.errorResponse(w, r, http.StatusInternalServerError, msg)
}

// Sends out the 404 Not Found status code and JSON response to the client.
func (app *application) notFoundResponse(w http.ResponseWriter, r *http.Request) {
	msg := "The requested resource is not found!"
	app.errorResponse(w, r, http.StatusNotFound, msg)
}

// Sends out the 405 Method Not Allowed status code and JSON response to the client.
func (app *application) methodNotAllowedResponse(w http.ResponseWriter, r *http.Request) {
	msg := fmt.Sprintf("The %s method is not supported!", r.Method)
	app.errorResponse(w, r, http.StatusMethodNotAllowed, msg)
}

func (app *application) invalidCredentialResponse(w http.ResponseWriter, r *http.Request) {
	msg := "Invalid authentication credentials"
	app.errorResponse(w, r, http.StatusUnauthorized, msg)
}
