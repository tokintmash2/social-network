package handlers

import (
	"encoding/json"
	"net/http"
	"social-network/utils"
	"strconv"
)

func (app *application) ListChatHandler(w http.ResponseWriter, r *http.Request) {
	if !app.IsAuthenticated(r) {
		app.invalidCredentialResponse(w, r)
		return
	}

	userID := app.contextGetUser(r)

	time := r.URL.Query().Get("timestamp")
	receiver, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	profile, err := utils.GetUserProfile(receiver)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}
	messages, err := app.chat.GetUserMessages(userID, receiver, time, 10)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusOK, envelope{"data": envelope{"messages": messages, "profile": profile}}, nil)
}

func (app *application) SaveChatHandler(w http.ResponseWriter, r *http.Request) {

	userID := app.contextGetUser(r)

	var input struct {
		Message  string `json:"message"`
		Receiver int    `json:"receiver"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	if input.Message == "" {
		app.errorResponse(w, r, http.StatusBadRequest, "Message cannot be empty")
		return
	}

	message, err := app.chat.SaveMessage(userID, input.Receiver, input.Message)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data, err := json.Marshal(envelope{"response_to": "chat_message", "data": message})

	// Only send if json.marshal worked.
	if err != nil {
		app.logger.Error(err.Error())
	} else {
		// Also broadcast to anyone connected right now
		go func() {
			app.logger.Debug("Sending message to sender's websocket")
			app.hub.outgoing <- OutgoingMessage{
				userID: userID,
				data:   data,
			}
		}()
		go func() {
			app.logger.Debug("Sending message to receiver's websocket")
			app.hub.outgoing <- OutgoingMessage{
				userID: input.Receiver,
				data:   data,
			}
		}()
	}

	app.writeJSON(w, http.StatusOK, envelope{"data": message}, nil)
}
