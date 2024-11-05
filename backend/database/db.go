package database

import (
	"database/sql"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite"
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

func runMigrations(db *sql.DB) error {
	driver, err := sqlite.WithInstance(db, &sqlite.Config{})
	if err != nil {
		return err
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://database/migrations",
		"sqlite3",
		driver,
	)
	if err != nil {
		return err
	}

	// Up applies all available migrations
	return m.Up()
}
