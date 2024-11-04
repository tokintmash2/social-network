package main

import (
	"database/sql"
	"log"
	"social-network/database"
)

var db *sql.DB

func main() {
	var err error

	// Connect to the SQLite database
	db, err = sql.Open("sqlite3", "database.db")
	if err != nil {
		log.Fatal("Error while connecting to the database:", err)
	}
	defer db.Close() // Close the database connection when main() exits

	// Initialize the forum database and create necessary tables
	database.ConnectToDB()
	database.CreateTables()
}
