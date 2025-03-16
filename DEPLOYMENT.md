# GRC CMMC Application Deployment Guide

This document outlines the steps required to deploy the GRC CMMC application in a production environment.

## Prerequisites

- Docker and Docker Compose installed on the target server
- Access to ports 5000 (application) and 5432 (database)
- At least 2GB of RAM and 1 CPU core
- At least 10GB of disk space

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd grc-app
```

### 2. Create Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgres://postgres:postgres@postgres:5432/grc_db
JWT_SECRET=your_strong_jwt_secret_key
JWT_REFRESH_SECRET=your_strong_jwt_refresh_secret_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
```

Be sure to replace the JWT secrets with strong, randomly generated keys.

### 3. Build and Start the Application

```bash
docker compose down -v --remove-orphans
docker compose up --build -d
```

This will:
- Build the Docker images
- Create a PostgreSQL database
- Set up the database schema
- Seed the database with sample data
- Start the application

### 4. Verify the Deployment

- The API should be accessible at `http://<server-ip>:5000/api`
- The frontend should be accessible at `http://<server-ip>:5000`
- You can log in with the default admin account:
  - Email: admin@example.com
  - Password: Password123!

### 5. Change Default Credentials

After deployment, you should immediately change the default admin password:
1. Log in with the default credentials
2. Navigate to the user profile
3. Change the password to a strong, unique password

### 6. Production Hardening

For a production environment, consider these additional security measures:

#### Secure Database Credentials

Change the PostgreSQL password in the docker-compose.yml file and the .env file.

```yaml
# docker-compose.yml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: your_secure_password
```

```
# .env
DATABASE_URL=postgres://postgres:your_secure_password@postgres:5432/grc_db
```

#### Configure HTTPS

For production deployment, set up an HTTPS proxy (like Nginx) in front of the application.

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Update CORS Settings

In a production environment, restrict CORS to only the domains that need access.

```
# .env
CORS_ORIGIN=https://your-domain.com
```

### 7. Backup and Maintenance

#### Database Backups

Set up regular PostgreSQL backups:

```bash
docker compose exec postgres pg_dump -U postgres -d grc_db > backup_$(date +%Y-%m-%d).sql
```

#### Application Updates

To update the application:

1. Pull the latest changes
   ```bash
   git pull
   ```

2. Rebuild and restart the containers
   ```bash
   docker compose down
   docker compose up --build -d
   ```

## Troubleshooting

### Application Not Starting

Check the logs:
```bash
docker compose logs app
```

### Database Connection Issues

Check the database connection:
```bash
docker compose logs postgres
```

Verify the database is running:
```bash
docker compose exec postgres psql -U postgres -c "SELECT 1;"
```

### Reset the Application

To completely reset the application and its data:
```bash
docker compose down -v
docker compose up --build
```

This will remove all volumes and start fresh. 