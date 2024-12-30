package handlers

import (
	"encoding/json"
	"social-network/structs"
)

func (app *application) sendWSNotification(notifications []structs.Notification) {
	for _, notification := range notifications {
		data, err := json.Marshal(notification)
		if err != nil {
			app.logger.Error(err.Error())
			return
		}

		go func() {
			app.hub.outgoing <- OutgoingMessage{
				userID: notification.UserID,
				data:   data,
			}
		}()
	}
}
