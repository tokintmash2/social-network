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

func responseData(ctx MessageContext, data interface{}) ([]byte, error) {
	res, err := json.Marshal(envelope{
		"response_to": ctx.Action,
		"response_id": ctx.RequestID,
		"data":        data,
	})
	if err != nil {
		return nil, err
	}
	return res, nil
}

func responseError(ctx MessageContext, data interface{}) ([]byte, error) {
	res, err := json.Marshal(envelope{
		"response_to": ctx.Action,
		"response_id": ctx.RequestID,
		"error":       data,
	})
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (app *application) wsResponse(ctx MessageContext, data interface{}) {
	res, reserr := responseData(ctx, data)
	if reserr != nil {
		app.logger.Warn("Could not respond to ws client", slog.Any("err", reserr.Error()))
		return
	}
	app.hub.outgoing <- OutgoingMessage{
		socketID: ctx.SocketID,
		data:     res,
	}
}

func (app *application) wsErrorResponse(ctx MessageContext, data interface{}) {
	res, reserr := responseError(ctx, data)
	if reserr != nil {
		app.logger.Warn("Could not respond with error to ws client", slog.Any("err", reserr.Error()))
		return
	}
	app.hub.outgoing <- OutgoingMessage{
		socketID: ctx.SocketID,
		data:     res,
	}
}

func (app *application) handleEcho(ctx MessageContext, payload json.RawMessage) {
	app.wsResponse(ctx, payload)
}

func (app *application) handleGetConversations(ctx MessageContext, payload json.RawMessage) {
	var input struct {
		Recipient         int       `json:"recipient"`
		EarliestTimestamp time.Time `json:"earliest_timestamp"`
	}

	err := json.NewDecoder(bytes.NewReader(payload)).Decode(&input)
	if err != nil {
		app.logger.Warn("Not valid payload", slog.Any("err", err.Error()))
		app.wsErrorResponse(ctx, err)
		return
	}

	response := utils.GetRecentMessages(
		ctx.UserID,
		input.Recipient,
		input.EarliestTimestamp,
	)

	app.wsResponse(ctx, response)
}
func (app *application) handleUserMessage(ctx MessageContext, payload json.RawMessage) {
	var input structs.Message

	err := json.NewDecoder(bytes.NewReader(payload)).Decode(&input)
	if err != nil {
		app.logger.Warn("Not valid payload")
		app.wsErrorResponse(ctx, err)
		return
	}

	message, err := utils.SaveMessage(input)

	if err != nil {
		app.logger.Error(err.Error())
		app.wsErrorResponse(ctx, err)
		return
	}

	outdata, err := responseData(ctx, message)
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
	app.wsResponse(ctx, response)
}
