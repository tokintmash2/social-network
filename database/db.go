package database

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

// Global variable to hold the database connection
var DB *sql.DB

func ConnectToDB() {
	database, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		log.Fatal("Error while connecting to the database:", err)
	}
	DB = database // Assigning the database connection to the global variable
}
