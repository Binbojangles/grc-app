@echo off
echo Starting GRC CMMC application in development mode...

REM Start the backend server
echo Starting backend server in development mode...
start cmd /k "npm run dev"

REM Start the Angular client
echo Starting Angular client in development mode...
start cmd /k "npm run client"

echo Development environment started! Access the application at:
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:4200 