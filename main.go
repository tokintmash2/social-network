package main

import (
	"social-network/backend/database"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	

	// Initialize the forum database and create necessary tables
	database.ConnectToDB()
	defer database.DB.Close()
	// err = database.RunMigrations(database.DB)
	database.RunMigrations(database.DB)

	
}
