#!/bin/sh
set -e

echo "Waiting for database..."
until nc -z "${DBHOST:-postgres}" "${DBPORT:-5432}"; do
  sleep 1
done

echo "Running migrations..."
npm run migration:run:prod

echo "Starting app..."
exec node dist/main.js
