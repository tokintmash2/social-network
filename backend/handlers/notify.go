package handlers

import (
	"log/slog"
	"social-network/structs"
)

func (app *application) sendWSNotification(notifications []structs.Notification) {
	for _, notification := range notifications {
		data, err := actionData("notification", notification)
		if err != nil {
			app.logger.Error(err.Error())
			return
		}
		app.logger.Debug(
			"Sending WS notification",
			slog.Any("userID", notification.UserID),
			slog.Any("data", data),
		)

		go func() {
			app.hub.outgoing <- OutgoingMessage{
				userID: notification.UserID,
				data:   data,
			}
		}()
	}
}
