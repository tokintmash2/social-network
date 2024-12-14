// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package handlers

import (
	"bytes"
	"encoding/json"
	"log/slog"

	"github.com/gofrs/uuid/v5"
)

type OutgoingMessage struct {
	socketID uuid.UUID
	userID   int
	data     []byte
}

type IncomingMessage struct {
	socketID uuid.UUID
	userID   int
	data     []byte
}

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	incoming chan IncomingMessage

	// Outbound messages to the clients.
	outgoing chan OutgoingMessage

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

type MessageContext struct {
	Action    string
	RequestID string
	SocketID  uuid.UUID
	UserID    int
}

type UserOnlineMessage struct {
	UserID int    `json:"user_id"`
	Action string `json:"user_action"`
}

func newHub() *Hub {
	return &Hub{
		incoming:   make(chan IncomingMessage),
		outgoing:   make(chan OutgoingMessage),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) run(app *application) {
	for {
		select {
		case client := <-h.register:
			app.logger.Info("Connected ws:", "wsid", client.socketID.String())
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.outgoing:
			for client := range h.clients {
				if message.socketID != uuid.Nil {
					if client.socketID != message.socketID {
						continue
					}
				}
				if message.userID != 0 {
					if client.userID != message.userID {
						continue
					}
				}
				select {
				case client.send <- message.data:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		case message := <-h.incoming:
			var input struct {
				Action    string          `json:"action"`
				RequestID string          `json:"request_id"`
				Data      json.RawMessage `json:"data"`
			}

			err := json.NewDecoder(bytes.NewReader(message.data)).Decode(&input)
			if err != nil {
				go func() {
					h.outgoing <- OutgoingMessage{
						socketID: message.socketID,
						data:     []byte(`{"error":"Bad websocket message!"}`),
					}
				}()
				app.logger.Error(err.Error())
				continue
			}

			ctx := MessageContext{
				Action:    input.Action,
				RequestID: input.RequestID,
				UserID:    message.userID,
				SocketID:  message.socketID,
			}
			app.logger.Debug("Incoming message", slog.Any("ctx", ctx))

			switch input.Action {
			case "echo":
				go app.handleEcho(ctx, input.Data)
			case "get_conversations":
				go app.handleGetConversations(ctx, input.Data)
			case "user_message":
				go app.handleUserMessage(ctx, input.Data)
			case "online_users":
				go app.handleGetOnlineUsers(ctx, input.Data)
			default:
				app.logger.Warn("Unknown action", slog.Any("action", input.Action))
				go func() {
					h.outgoing <- OutgoingMessage{
						socketID: message.socketID,
						data:     []byte(`{"error":"Missing or unknown action key!"}`),
					}
				}()
			}
		}
	}
}

func (h *Hub) GetOnlineUsers() []int {
	var users []int

	for client := range h.clients {
		if client.userID != 0 {
			users = append(users, client.userID)
		}
	}
	return users
}
