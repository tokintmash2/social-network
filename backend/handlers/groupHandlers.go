package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func (app *application) GroupChatListHandler(w http.ResponseWriter, r *http.Request) {
	userID := app.contextGetUser(r)

	groups, err := app.groups.GetGroupList(userID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusOK, envelope{"groups": groups}, nil)
}

func (app *application) SaveGroupChatHandler(w http.ResponseWriter, r *http.Request) {

	userID := app.contextGetUser(r)
	groupID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	var input struct {
		Message string `json:"message"`
	}

	err = json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	if input.Message == "" {
		app.errorResponse(w, r, http.StatusBadRequest, "Message cannot be empty")
		return
	}

	message, notifyIDs, err := app.groups.SaveMessage(userID, groupID, input.Message)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	data, err := json.Marshal(envelope{"response_to": "group_message", "data": message})

	if err != nil {
		app.logger.Error(err.Error())
	} else {
		for _, id := range notifyIDs {
			go func() {
				app.logger.Debug("Sending message to sender's websocket")
				app.hub.outgoing <- OutgoingMessage{
					userID: id,
					data:   data,
				}
			}()
		}
	}

	app.writeJSON(w, http.StatusOK, envelope{"data": message}, nil)
}

func (app *application) ListGroupChatHandler(w http.ResponseWriter, r *http.Request) {
	if !app.IsAuthenticated(r) {
		app.invalidCredentialResponse(w, r)
		return
	}

	userID := app.contextGetUser(r)

	time := r.URL.Query().Get("timestamp")
	groupID, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, err.Error())
		return
	}

	messages, err := app.groups.GetGroupMessages(userID, groupID, time, 10)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	app.writeJSON(w, http.StatusOK, envelope{"data": envelope{"messages": messages}}, nil)
}
