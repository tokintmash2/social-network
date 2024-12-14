// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package handlers

import (
	"log"
	"log/slog"
	"net/http"
	"social-network/utils"
	"time"

	"github.com/gofrs/uuid/v5"
	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte

	// Unique socket ID
	socketID uuid.UUID

	// Authenticated user ID
	userID int
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		msg := IncomingMessage{
			socketID: c.socketID,
			userID:   c.userID,
			data:     message,
		}
		c.hub.incoming <- msg
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// WebSocketHandler handles websocket requests from the peer.
func (app *application) WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	clientID, err := uuid.NewV4()
	if err != nil {
		app.logger.Error(err.Error())
		http.Error(w, "Internal server error!", http.StatusInternalServerError)
		return
	}

	cookie, err := r.Cookie("session")
	if err != nil {
		app.logger.Error("Error getting session cookie:", slog.Any("err", err))
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Use sessionUUID to get userID
	userID, valid := utils.VerifySession(cookie.Value, "Handleconnections")
	if !valid {
		app.logger.Error("Invalid session:", slog.Any("err", err))
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	upgrader.CheckOrigin = checkFrontendOrigin
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		app.logger.Error(err.Error())
		return
	}
	client := &Client{
		hub:      app.hub,
		conn:     conn,
		send:     make(chan []byte, 256),
		socketID: clientID,
		userID:   userID,
	}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}

func checkFrontendOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	return origin == "http://localhost:3000"
}
