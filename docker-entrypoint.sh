#!/bin/bash
set -e

echo "Waiting for database to be ready..."
# Number of retries
count=0
# Set maximum number of retries
max_retries=30
# Sleep duration between retries in seconds
sleep_time=2

# Try to connect to the database
until pg_isready -h postgres -p 5432 || [ $count -eq $max_retries ]; do
  echo "Waiting for database to be ready... ($count/$max_retries)"
  sleep $sleep_time
  count=$((count + 1))
done

# If we couldn't connect after max retries, exit
if [ $count -eq $max_retries ]; then
  echo "Could not connect to database after $max_retries retries"
  exit 1
fi

# Setup database
echo "Setting up database..."
npm run setup:db || echo "Database setup will be performed at runtime."

# Create departments table if it doesn't exist
echo "Setting up departments table..."
node scripts/create-departments-table-standalone.js || echo "Could not create departments table."

# Simple style update - run the script directly
echo "Running style update script..."
node scripts/update-styles.js || echo "Style update not critical, continuing..."

# Start the application
if [ "${1#-}" != "$1" ]; then
  set -- node "$@"
fi

exec "$@" 