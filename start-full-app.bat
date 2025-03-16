@echo off
echo Building and starting the full GRC CMMC application with Docker Compose...

REM Stop any running containers and remove volumes
docker compose down -v --remove-orphans

REM Build and start containers
docker compose up --build

echo Docker Compose has been stopped. To start it again, run:
echo docker compose up 