package database

import (
	"database/sql"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite"
	_ "github.com/golang-migrate/migrate/v4/source/file"
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

func RunMigrations(db *sql.DB) error {
	log.Println("Running migrations...")
	// driver, err := sqlite.WithInstance(db, &sqlite.Config{})
	// if err != nil {
	// 	return err
	// }

	// m, err := migrate.NewWithDatabaseInstance(
	// 	"file://backend/database/migrations",
	// 	"sqlite3",
	// 	driver,
	// )
	// if err != nil {
	// 	return err
	// }

	driver, err := sqlite.WithInstance(db, &sqlite.Config{})
	if err != nil {
		log.Fatal("Could not create SQLite driver:", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://backend/database/migrations",
		"sqlite3", driver)
	if err != nil {
		log.Fatal("Could not create migrate instance:", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal("Could not run up migrations:", err)
	}

	log.Println("Migrations applied successfully")

	// Up applies all available migrations
	return m.Up()
}
