# # Build stage
# FROM node:23-alpine3.20 AS builder

# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy source code
# COPY . .

# # Build the application
# RUN npm run build

# # Final stage
# FROM node:23-alpine3.20

# WORKDIR /app

# # Copy necessary files from builder
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/node_modules ./node_modules

# # Start the application
# CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

FROM node:23-alpine3.20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Start in development mode
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]