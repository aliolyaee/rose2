#!/bin/sh
set -e

# Wait for Postgres (simple wait; replace with proper wait-for-it if needed)
echo "Waiting for database..."
sleep 5

echo "Running migrations..."
npm run migration:run || true

echo "Starting app..."
exec "$@"
