# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the project (compiles TypeScript and builds the client)
RUN npm run build

# Build the server
RUN npm run build:server

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the built client and server files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./server.js

# Set environment variable to use port 3000 or default to 3000
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Add this line just before the CMD instruction
RUN ls -la /app && ls -la /app/dist

# Start the server
CMD ["node", "server.js"]