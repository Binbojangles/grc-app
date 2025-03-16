FROM node:18-slim

# Install PostgreSQL client for health checks
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies for the Node.js server
COPY package*.json ./
RUN npm install

# Build the Angular client
WORKDIR /usr/src/app/client
COPY client/package*.json ./
RUN npm install

# Copy client source and build
COPY client/ ./
RUN npm run build

# Return to main directory and copy server source
WORKDIR /usr/src/app
COPY . .

# Copy .env.example to .env if .env doesn't exist
RUN if [ ! -f .env ]; then cp .env.example .env || echo "No .env.example file found"; fi

# Setup the database directory
RUN mkdir -p database/seeds

# Make the entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Expose port
EXPOSE 5000

# Set entrypoint
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh"]

# Start the application
CMD ["node", "server.js"]
