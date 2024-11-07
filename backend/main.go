package main

import (
	"social-network/database"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func main() {

	// Initialize the forum database and create necessary tables
	database.ConnectToDB()
	defer database.DB.Close()
	// err = database.RunMigrations(database.DB)
	database.RunMigrations(database.DB)

	
	// utils.CreateSession(1)
	// pass, _ := utils.HashPassword("password")
	// fmt.Println(pass)

}
