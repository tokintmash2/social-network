# Build stage
FROM golang:1.23-alpine3.20 AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev libc-dev

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=1 go build -o main .

# Final stage
FROM alpine:3.20

WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache curl

# Copy the binary from builder
COPY --from=builder /app/main .
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/database/migrations ./database/migrations

# Run the binary
CMD ["./main"]