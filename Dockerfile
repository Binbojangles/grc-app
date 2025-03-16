FROM node:16-alpine as build

WORKDIR /usr/src/app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install --production

# Copy and build client
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client/ ./client/
RUN cd client && npm run build

# Copy backend code
COPY . .

# Second stage: runtime
FROM node:16-alpine

WORKDIR /usr/src/app

# Copy built client and backend
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/server.js ./
COPY --from=build /usr/src/app/app ./app
COPY --from=build /usr/src/app/client/dist/client ./client/dist

# Expose application port
EXPOSE 5000

# Run the application with limited privileges
USER node

CMD ["npm", "start"]
