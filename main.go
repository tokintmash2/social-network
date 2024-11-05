package main

import (
	"database/sql"
	"log"
	"social-network/database"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
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

	// Run migrations
	driver, err := sqlite.WithInstance(db, &sqlite.Config{})
	if err != nil {
		log.Fatal("Could not create SQLite driver:", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://database/migrations/sqlite",
		"sqlite3", driver)
	if err != nil {
		log.Fatal("Could not create migrate instance:", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal("Could not run up migrations:", err)
	}

	log.Println("Migrations applied successfully")
}
