# Social Network Project

A school assigment to create a modern social networking platform built with Next.js and Go, featuring real-time interactions and comprehensive user engagement features.

- More info about the task: [social-network](https://github.com/01-edu/public/tree/master/subjects/social-network)

Test users:

- e-mail: `asd@asd.ee`, password: `123`
- e-mail: `User@email.com`, password: `123`
- e-mail: `qwe@qwe.ee`, password: `123`
- e-mail: `test@mail.ee`, yep, you've guessed it, password: `123`, private account

## Table of Contents

- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
    - [Backend](#backend)
    - [Frontend](#frontend)
- [Setup](#setup)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
- [Running with Docker](#running-with-docker)
- [Authors](#authors)


## Core Features

-   **User Authentication**: Secure registration and login system with session management
-   **Profile Management**: Public and private profiles with customizable user information
-   **Social Connections**: Follow system with request handling for private profiles
-   **Posts**: Create and share posts with privacy controls (public, private, selective)
-   **Groups**: Create and join groups with event organization capabilities
-   **Real-time Chat**: Private messaging and group chat using WebSocket
-   **Notifications**: Real-time notifications for social interactions

## Tech Stack

### Backend

-   Go
-   SQLite database
-   WebSocket implementation
-   Session-based authentication

### Frontend

-   Next.js 15.0.2
-   TypeScript
-   WebSocket for real-time features
-   DaisyUI for UI components

## Setup

Clone the repository:

```
git clone https://github.com/tokintmash2/social-network.git
cd social-network
```

### Backend Setup

1. Navigate to backend directory in one terminal:

    ```bash
    cd backend
    ```

2. Install Go dependencies and start the backend server:

    ```bash
    go mod tidy
    go run main.go
    ```

The server will run on http://localhost:8080

### Frontend Setup

1. Navigate to frontend directory in a second terminal:

    ```bash
    cd frontend
    ```

2. Install dependencies and run production server:

    ```bash
    npm install
    npm run build
    npm start
    ```

You can start using the application at http://localhost:3000

## Running with Docker

Make sure you have [Docker](https://www.docker.com/) installed.

1. Build images, start containers

    ```bash
    docker-compose -f docker-compose.yaml up
    ```

You can start using the application at http://localhost:3000

2. Optional: Stop the containers (preserves containers and data)

    ```bash
    docker-compose stop
    ```

3. Optional: Restart stopped containers

    ```bash
    docker-compose start
    ```

4. Stop and remove images, containers and networks

    ```bash
    docker-compose -f docker-compose.yaml down --rmi all
    ```

## Authors:

Imbi Haljasorg | Discord: imbira \
Kadri Kängsep | Discord: kadrika \
Liis Eiland | Discord: liiseiland \
Liina-Maria Bakhoff | Discord: liinabakhoff \
Miikael Volkonski | Discord: tokintmash