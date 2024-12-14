package handlers

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"social-network/structs"
	"social-network/utils"
	"time"
)

type envelope map[string]any

func (app *application) handleEcho(ctx MessageContext, payload json.RawMessage) {
	data, err := json.Marshal(payload)
	if err != nil {
		app.logger.Error(err.Error())
		return
	}
	app.hub.outgoing <- OutgoingMessage{
		socketID: ctx.SocketID,
		data:     data,
	}
}

func (app *application) handleGetConversations(ctx MessageContext, payload json.RawMessage) {
	var input struct {
		Recipient         int       `json:"recipient"`
		EarliestTimestamp time.Time `json:"earliest_timestamp"`
	}

	err := json.NewDecoder(bytes.NewReader(payload)).Decode(&input)
	if err != nil {
		app.logger.Warn("Not valid payload", slog.Any("err", err.Error()))
		return
	}

	response := utils.GetRecentMessages(
		ctx.UserID,
		input.Recipient,
		input.EarliestTimestamp,
	)

	outdata, err := json.Marshal(envelope{
		"reponse_to": ctx.Action,
		"data":       response,
	})
	if err == nil {
		app.hub.outgoing <- OutgoingMessage{
			socketID: ctx.SocketID,
			data:     outdata,
		}
	}
}
func (app *application) handleUserMessage(ctx MessageContext, payload json.RawMessage) {
	var input structs.Message

	err := json.NewDecoder(bytes.NewReader(payload)).Decode(&input)
	if err != nil {
		app.logger.Warn("Not valid payload")
		return
	}

	message, err := utils.SaveMessage(input)

	if err != nil {
		app.logger.Error(err.Error())
		return
	}

	outdata, err := json.Marshal(envelope{
		"reponse_to": ctx.Action,
		"data":       message,
	})
	if err == nil {
		app.hub.outgoing <- OutgoingMessage{
			userID: ctx.UserID,
			data:   outdata,
		}
		app.hub.outgoing <- OutgoingMessage{
			userID: message.Recipient,
			data:   outdata,
		}
	}
}

func (app *application) handleGetOnlineUsers(ctx MessageContext, _ json.RawMessage) {

	response := app.hub.GetOnlineUsers()

	outdata, err := json.Marshal(envelope{
		"reponse_to": ctx.Action,
		"data":       response,
	})
	if err == nil {
		app.hub.outgoing <- OutgoingMessage{
			socketID: ctx.SocketID,
			data:     outdata,
		}
	}
}
