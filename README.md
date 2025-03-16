# GRC Application for CMMC 2.0 Compliance

A comprehensive Governance, Risk, and Compliance (GRC) application for CMMC 2.0 compliance management.

## Features

- Support for all three CMMC 2.0 levels (Foundational, Advanced, Expert)
- Coverage of all 14 CMMC domains with appropriate controls
- Asset inventory management
- Access control management
- Audit and accountability tracking
- Security training administration
- Configuration management
- Incident response workflows
- Risk assessment and management
- Policy management repository
- Compliance checklist with progress tracking
- Evidence collection and management

## Technology Stack

- **Frontend**: Angular with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Containerization**: Docker and Docker Compose

## Setup and Installation

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- npm 8+

### Running with Docker (Recommended)

The easiest way to run the application is using Docker Compose:

1. Clone the repository
   ```
   git clone <repository-url>
   cd grc-app
   ```

2. Start the application using the provided batch file
   ```
   .\start-full-app.bat
   ```

   Or manually with Docker Compose:
   ```
   docker compose down -v --remove-orphans
   docker compose up --build
   ```

3. Access the application at http://localhost:5000

4. Log in with the default admin account:
   - Email: admin@example.com
   - Password: Password123!

### Local Development

1. Clone the repository
   ```
   git clone <repository-url>
   cd grc-app
   ```

2. Install backend dependencies
   ```
   npm install
   ```

3. Install frontend dependencies
   ```
   cd client
   npm install
   cd ..
   ```

4. Start the PostgreSQL database
   ```
   docker compose up postgres -d
   ```

5. Set up the database
   ```
   npm run setup:db
   ```

6. Start the backend server
   ```
   npm start
   ```

7. In a separate terminal, start the frontend development server
   ```
   cd client
   npm start
   ```

8. Access the backend API at http://localhost:5000/api and the frontend at http://localhost:4200

## Project Structure

```
grc-app/
├── client/                 # Frontend Angular application
│   ├── src/                # Application source code
│   │   ├── app/            # Angular components, services, and modules
│   │   ├── environments/   # Environment configuration
│   │   └── assets/         # Static assets
├── controllers/            # API controllers
├── middlewares/            # Express middlewares
├── models/                 # Data models
├── routes/                 # API routes
├── scripts/                # Utility scripts for setup
├── services/               # Business logic services
├── database/               # Database seeds and migrations
├── Dockerfile              # Main application Dockerfile
├── docker-compose.yml      # Docker Compose configuration
├── server.js               # Node.js server entry point
└── package.json            # Node.js dependencies
```

## Development

For ongoing development, refer to the extensive documentation in the codebase. The application follows standard Angular and Node.js/Express practices.

## License

[Add License Information]
