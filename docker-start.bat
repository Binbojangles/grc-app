@echo off
echo Taking down existing containers...
docker compose down -v

echo Starting GRC CMMC application using Docker Compose...

REM Build and start the containers
docker-compose up --build

echo Docker Compose has been stopped. To start it again, run:
echo docker-compose up 