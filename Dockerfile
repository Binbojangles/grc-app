FROM node:18-slim

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

# Setup the database
RUN mkdir -p database/seeds
RUN npm run setup:db || echo "Database setup will be performed at runtime"

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
