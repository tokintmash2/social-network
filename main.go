package main

import (
	"database/sql"
	"log"
	"social-network/database"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func main() {
	var err error

	// server := &WebSocketServer{
	// 	clients: make(map[string]*Client),
	// }

	// Connect to the SQLite database
	db, err = sql.Open("sqlite3", "forum.db")
	if err != nil {
		log.Fatal("Error while connecting to the database:", err)
	}
	defer db.Close() // Close the database connection when main() exits

	// Initialize the forum database and create necessary tables
	database.ConnectToForumDB()
	database.CreateTables()
}
