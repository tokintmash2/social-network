package main

import (
	"fmt"
	"net/http"
	"social-network/database"
	"social-network/database/middleware"
	"social-network/handlers"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func main() {

	// Initialize the database and create necessary tables
	database.ConnectToDB()
	defer database.DB.Close()
	// err = database.RunMigrations(database.DB)
	database.RunMigrations(database.DB)

	mux := http.NewServeMux()
	server := &http.Server{
		Addr: ":8080",
		Handler: middleware.CorsMiddleware(mux),
		// Handler: mux,
	}
	handlers.RunHandlers(mux)
	fmt.Println("Backend running on port 8080")
	err := server.ListenAndServe()
	if err != nil {
		panic(err)
	}

}
