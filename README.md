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

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Containerization**: Docker and Docker Compose

## Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 16+
- npm 8+

### Local Development

1. Clone the repository
   ```
   git clone <repository-url>
   cd grc-app
   ```

2. Start the development environment
   ```
   docker-compose up -d
   ```

3. Install dependencies and run development servers
   ```
   npm run install:all
   npm run dev:all
   ```

4. Access the application at http://localhost:3000

## Project Structure

```
grc-app/
├── app/                    # Backend application code
│   ├── components/         # Reusable application components
│   ├── modules/            # Feature modules (domains, controls, etc.)
│   ├── services/           # Core services (auth, db, etc.)
│   └── utils/              # Utility functions
├── client/                 # Frontend React application
├── docker/                 # Docker configuration files
├── Dockerfile              # Main application Dockerfile
├── docker-compose.yml      # Docker Compose configuration
└── package.json            # Node.js dependencies
```

## License

[Add License Information]
