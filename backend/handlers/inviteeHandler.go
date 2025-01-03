package handlers

import (
	"log"
	"net/http"
)

func (app *application) InviteeHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("InviteeHandler called")
}
