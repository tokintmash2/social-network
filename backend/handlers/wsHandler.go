package handlers

import (
	"encoding/json"
	"social-network/structs"
	"social-network/utils"
	"time"
)

type envelope map[string]any

func (app *application) handleEcho(msg IncomingMessage, payload interface{}) {
	data, err := json.Marshal(payload)
	if err != nil {
		app.logger.Error(err.Error())
		return
	}
	app.hub.outgoing <- OutgoingMessage{
		socketID: msg.socketID,
		data:     data,
	}
}

func (app *application) handleGetConversations(msg IncomingMessage, payload interface{}) {
	type Input struct {
		Action            string
		Recipient         int
		EarliestTimestamp time.Time
	}
	// TODO: check payload
	input, ok := payload.(Input)
	if !ok {
		app.logger.Warn("Not valid payload")
		return
	}

	response := utils.GetRecentMessages(
		msg.userID,
		input.Recipient,
		input.EarliestTimestamp,
	)

	outdata, err := json.Marshal(envelope{
		"reponse_to": input.Action,
		"data":       response,
	})
	if err == nil {
		app.hub.outgoing <- OutgoingMessage{
			socketID: msg.socketID,
			data:     outdata,
		}
	}
}
func (app *application) handleUserMessage(msg IncomingMessage, payload interface{}) {
	type Input struct {
		Action  string
		Message structs.Message
	}
	input, ok := payload.(Input)
	if !ok {
		app.logger.Warn("Not valid payload")
		return
	}

	message, err := utils.SaveMessage(input.Message)

	if err != nil {
		app.logger.Error(err.Error())
		return
	}

	outdata, err := json.Marshal(envelope{
		"reponse_to": input.Action,
		"data":       message,
	})
	if err == nil {
		app.hub.outgoing <- OutgoingMessage{
			userID: msg.userID,
			data:   outdata,
		}
		app.hub.outgoing <- OutgoingMessage{
			userID: message.Recipient,
			data:   outdata,
		}
	}
}

func (app *application) handleGetOnlineUsers(msg IncomingMessage, payload interface{}) {
	type Input struct {
		Action string
	}
	input, ok := payload.(Input)
	if !ok {
		app.logger.Warn("Not valid payload")
		return
	}

	// TODO: for only list of user's contacts who are online,
	// need to fetch that list before and filter here
	response := app.hub.GetOnlineUsers()

	outdata, err := json.Marshal(envelope{
		"reponse_to": input.Action,
		"data":       response,
	})
	if err == nil {
		app.hub.outgoing <- OutgoingMessage{
			socketID: msg.socketID,
			data:     outdata,
		}
	}
}
