#!/bin/bash

# Start the development environment
echo "Starting GRC CMMC application in development mode..."

# Terminal 1: Start the backend server
echo "Starting backend server in development mode..."
gnome-terminal -- npm run dev &

# Terminal 2: Start the Angular client
echo "Starting Angular client in development mode..."
gnome-terminal -- npm run client &

echo "Development environment started! Access the application at:"
echo "- Backend: http://localhost:5000"
echo "- Frontend: http://localhost:4200" 