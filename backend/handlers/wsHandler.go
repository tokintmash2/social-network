package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"social-network/structs"
	"social-network/utils"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var (
	connectionsMap   = make(map[string]*Client)
	broadcastChannel = make(chan structs.Message)
	mu               sync.Mutex
)

func init() {
	go broadcastMessage()
}

// Upgrader to upgrade HTTP connections to WebSocket connections.
var upgrader = websocket.Upgrader{ // buffers missing
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// CheckOrigin:     checkOrigin,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	connection  *websocket.Conn
	send        chan []byte
	mu          sync.Mutex
	connOwnerId string
	lastActive  time.Time
}

func HandleConnections(w http.ResponseWriter, r *http.Request) {

	// userID := strconv.Itoa(userIDWS)

	cookie, err := r.Cookie("session")
	if err != nil {
		log.Println("Error getting session cookie:", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	sessionUUID := cookie.Value
	log.Println("Session UUID:", sessionUUID)

	// Use sessionUUID to get userID
	userID, _ := utils.VerifySession(sessionUUID, "Handleconnections")
	if err != nil {
		log.Println("Invalid session:", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userIDStr := strconv.Itoa(userID)

	// Upgrade initial GET request to a websocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	// defer conn.Close()

	// Add client data
	client := &Client{
		connection:  conn,
		connOwnerId: userIDStr,
		send:        make(chan []byte, 256),
	}

	log.Println("Client ID: ", client.connOwnerId)

	// initial trigger for online users' request
	mu.Lock()
	connectionsMap[userIDStr] = client

	message := onlineUsers(userID)
	log.Println("Broadcasting online users:", message)

	sendMessage(client, message)

	// send fetch command to all clients
	fetchCommand := structs.Message{
		Type: "fetch_users",
	}
	broadcastChannel <- fetchCommand

	mu.Unlock()

	// Start goroutines for reading and writing
	go func() {
		defer func() {
			conn.Close()
			mu.Lock()
			delete(connectionsMap, userIDStr)

			fetchCommand := structs.Message{
				Type: "fetch_users",
			}
			broadcastChannel <- fetchCommand

			mu.Unlock()
		}()
		for {
			_, message, err := conn.ReadMessage() // Read whatever message is received
			if err != nil {
				log.Println("error reading message", err)
				break
			}

			var msg structs.Message
			err = json.Unmarshal(message, &msg)
			if err != nil {
				log.Println("Error unmarshalling message:", err)
				continue
			}

			log.Println("Received message:", msg)
			log.Println("Message date:", msg.CreatedAt)
			log.Println("Message type:", msg.Type)

			switch msg.Type {

			case "get_conversations":
				// log.Println("Received get_conversations request")

				partner, _ := strconv.Atoi(msg.Recipient)
				oldestMessageTime := msg.CreatedAt
				log.Println("Partner ID in switch:", partner)
				response := utils.GetRecentMessages(userID, partner, oldestMessageTime)
				log.Println("Response:", response)

				for _, responseMSG := range response {
					// broadcastChannel <- responseMSG
					sendMessage(client, responseMSG)
				}
				continue
			case "user-message":

				prepMessage(&msg, userID, msg.Recipient)

				mu.Lock()
				recipientConn, ok := connectionsMap[msg.Recipient]
				log.Println("connection:", recipientConn)
				mu.Unlock()

				if ok {
					handleNewMessage(msg)
				} else {
					log.Println("Recipient is not connected")
				}
			case "online_users":
				mu.Lock()
				sendMessage(client, onlineUsers(userID))
				mu.Unlock()
			case "fetch_users":
				// trigger fetch for all connected users
				log.Println("Received fetch_users request")
				for _, client := range connectionsMap {
					userID, _ := strconv.Atoi(client.connOwnerId)
					message := onlineUsers(userID)
					sendMessage(client, message)
				}
			default:
				log.Println("Unknown message type:", msg.Type)
			}
		}
	}()

	go func(client *Client) {
		defer func() {
			conn.Close()
			mu.Lock()
			delete(connectionsMap, userIDStr)
			mu.Unlock()
		}()

		for message := range client.send {
			client.mu.Lock()
			err := client.connection.WriteMessage(websocket.TextMessage, message)
			client.mu.Unlock()

			if err != nil {
				log.Println("Error writing message:", err)
				return
			}
		}
	}(client)

}

func onlineUsers(userID int) structs.Message {

	allUsers, err := utils.GetSortedUsers(userID)
	log.Println("allUsers from onlineUsers:", allUsers)
	if err != nil {
		log.Println("Error fetching sorted users:", err)
		return structs.Message{}
	}

	var onlineUsers, offlineUsers []structs.UserInfo

	for _, user := range allUsers {
		if _, ok := connectionsMap[strconv.Itoa(user.ID)]; ok {
			onlineUsers = append(onlineUsers, user)
		} else {
			offlineUsers = append(offlineUsers, user)
		}
	}

	// Sort only offline users alphabetically
	// sort.Slice(offlineUsers, func(i, j int) bool {
	// 	return strings.ToLower(offlineUsers[i].Username) < strings.ToLower(offlineUsers[j].Username)
	// })

	message := structs.Message{
		Type:         "online_users",
		// OnlineUsers:  onlineUsers,
		// OfflineUsers: offlineUsers,
	}

	return message
}

func prepMessage(m *structs.Message, senderID int, recipient string) {

	sender, _ := utils.GetUsername(senderID)
	recipientID, _ := strconv.Atoi(recipient)
	receiver, _ := utils.GetUsername(recipientID)

	m.Sender = senderID
	m.SenderUsername = sender
	m.ReceiverUsername = receiver
	m.CreatedAt = time.Now()
}

func sendMessage(recipientConn *Client, msg structs.Message) {
	// Convert message to JSON
	messageData, err := json.Marshal(msg)
	if err != nil {
		log.Println("Error marshalling message:", err)
		return
	}

	log.Println("Sending message to recipient:", recipientConn.connOwnerId)
	log.Println("Sending message to recipient:", msg)

	// Send the message into the recipient's send channel (non-blocking)
	select {
	case recipientConn.send <- messageData:
		// utils.SaveMessage(msg)
		// Successfully added the message to the recipient's send channel

	default:
		// Channel is full or blocked, handle disconnect, or log a warning
		log.Println("Recipient channel is full, disconnecting")
		close(recipientConn.send)
	}
}

func handleNewMessage(msg structs.Message) {
	// Save message to database once
	utils.SaveMessage(msg)

	// Send to recipient
	if recipientConn, ok := connectionsMap[msg.Recipient]; ok {
		sendMessage(recipientConn, msg)
	}

	// Send back to sender
	if senderConn, ok := connectionsMap[strconv.Itoa(msg.Sender)]; ok {
		sendMessage(senderConn, msg)
	}
}

func broadcastMessage() {
	for {
		message := <-broadcastChannel

		switch message.Type {
		case "fetch_users":
			log.Println("Received fetch_users request")
			// Trigger fetch for all connected users
			for _, client := range connectionsMap {
				userID, _ := strconv.Atoi(client.connOwnerId)
				message := onlineUsers(userID)
				sendMessage(client, message)
			}
		default:
			messageJSON, _ := json.Marshal(message)
			log.Println("Message in BroadcastChannel", message)

			mu.Lock()
			for _, client := range connectionsMap {
				select {
				case client.send <- []byte(messageJSON):
				default:
					close(client.send)
					delete(connectionsMap, client.connOwnerId)
				}
			}
			mu.Unlock()
		}
	}
}

// Only accept connections from localhost:4000
func checkOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")

	switch origin {
	case "localhost:4000/":
		return true
	default:
		return false
	}
}

func handleClientRead(conn *websocket.Conn, client *Client, userID int) {
	defer func() {
		// Cleanup code
	}()
	for {
		// Read message from browser
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("error reading message", err)
			break
		}

		var msg structs.Message
		err = json.Unmarshal(message, &msg)
		if err != nil {
			log.Println("Error unmarshalling message:", err)
			continue
		}

		prepMessage(&msg, userID, msg.Recipient) // Use the userID from the session

		mu.Lock()
		recipientConn, ok := connectionsMap[msg.Recipient]
		mu.Unlock()

		if ok {
			sendMessage(recipientConn, msg)
		} else {
			log.Println("Recipient is not connected")
		}
	}
}

func handleClientWrite(client *Client, userIDStr string) {
	defer func() {
		client.connection.Close()
		mu.Lock()
		delete(connectionsMap, userIDStr)
		mu.Unlock()
	}()

	for message := range client.send {
		client.mu.Lock()
		err := client.connection.WriteMessage(websocket.TextMessage, message)
		client.mu.Unlock()

		if err != nil {
			log.Println("Error writing message:", err)
			return
		}
	}
}
