@echo off
echo Starting GRC CMMC backend API using Docker Compose...

REM Stop existing containers
docker compose down -v

REM Build and start backend containers
docker compose -f docker-compose-backend.yml up -d

echo Backend API is running at http://localhost:5000
echo Database is available at localhost:5432 (postgres/postgres) 