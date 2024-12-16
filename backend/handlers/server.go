package handlers

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"social-network/database"
	"social-network/database/middleware"

	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

type application struct {
	logger *slog.Logger
	hub    *Hub
}

func SetupServer() {

	// writes log entries to the standard out stream.
	logOptions := slog.HandlerOptions{
		//Level: slog.LevelInfo,

		// For tester if they want to see detailed debug logs.
		Level: slog.LevelDebug,
	}
	logger := slog.New(slog.NewTextHandler(os.Stdout, &logOptions))

	app := &application{
		logger: logger,
		hub:    newHub(),
	}

	go app.hub.run(app)

	// Initialize the database and create necessary tables
	database.ConnectToDB()
	defer database.DB.Close()
	// err = database.RunMigrations(database.DB)
	database.RunMigrations(database.DB)

	mux := http.NewServeMux()
	server := &http.Server{
		Addr:    ":8080",
		Handler: middleware.CorsMiddleware(mux),
		// Handler: mux,
	}
	RunHandlers(mux, app)

	fmt.Println("Backend running on port 8080")
	err := server.ListenAndServe()
	if err != nil {
		panic(err)
	}

}
