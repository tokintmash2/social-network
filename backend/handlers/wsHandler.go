package handlers

import (
	"encoding/json"
	"log/slog"
)

func actionData(action string, data interface{}) ([]byte, error) {
	res, err := json.Marshal(envelope{
		"response_to": action,
		"data":        data,
	})
	if err != nil {
		return nil, err
	}
	return res, nil
}

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

func (app *application) handleGetOnlineUsers(ctx MessageContext, _ json.RawMessage) {
	response := app.hub.GetOnlineUsers()
	app.wsResponse(ctx, response)
}
