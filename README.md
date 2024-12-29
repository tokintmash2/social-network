# Social Network Project

A modern social networking platform built with Next.js and Go, featuring real-time interactions and comprehensive user engagement features.

## Running with Docker

```
# Build images if needed, start containers
docker-compose -f docker-compose.yaml up

# Stop the containers (preserves containers and data)
docker-compose stop
# Restart stopped containers
docker-compose start

# Stop and remove containers and networks
docker-compose -f docker-compose.yaml down
```

## Setup

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

Install Go dependencies and start the backend server:

```bash
go mod tidy
go run main.go
```

The server will run on http://localhost:8080

### Frontend Setup

Navigate to frontend directory:

```bash
cd frontend
```

Install dependencies and run production server:

```bash
npm install
npm run build
npm start
```

The application will be available at http://localhost:3000

## Core Features

-   **User Authentication**: Secure registration and login system with session management
-   **Profile Management**: Public and private profiles with customizable user information
-   **Social Connections**: Follow system with request handling for private profiles
-   **Posts**: Create and share posts with privacy controls (public, private, selective)
-   **Groups**: Create and join groups with event organization capabilities
-   **Real-time Chat**: Private messaging and group chat using WebSocket
-   **Notifications**: Real-time notifications for social interactions

## Tech Stack

### Frontend

-   Next.js 15.0.2
-   TypeScript
-   WebSocket for real-time features
-   DaisyUI for UI components

### Backend

-   Go
-   SQLite database
-   WebSocket implementation
-   Session-based authentication

### License

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/license/mit) file for details.

### Authors:

Miikael Volkonski | Discord: tokintmash

Liina-Maria Bakhoff | Discord: liinabakhoff
