#!/usr/bin/env bash
# Sets up a MongoDB 7 container for local AERO development.
# Run once: bash backend/setup-mongodb.sh
# After that, just start it: docker start aero-mongodb

set -euo pipefail

CONTAINER_NAME="aero-mongodb"
IMAGE="mongo:7"
DB_NAME="aero"
PORT=27017

echo ">>> Starting MongoDB container..."
docker run -d --name "$CONTAINER_NAME" \
  -p ${PORT}:27017 \
  "$IMAGE"

echo ">>> Waiting for MongoDB to be ready..."
until docker exec "$CONTAINER_NAME" mongosh --eval "db.runCommand({ ping: 1 })" > /dev/null 2>&1; do
  sleep 2
  printf "."
done
echo " ready."

echo ""
echo "=== MongoDB is ready ==="
echo "  Connection: mongodb://localhost:${PORT}/${DB_NAME}"
echo "  Shell:      docker exec -it ${CONTAINER_NAME} mongosh ${DB_NAME}"
echo ""
echo "Run the backend:  ./gradlew :backend:bootRun"
echo "Stop MongoDB:     docker stop ${CONTAINER_NAME}"
echo "Start again:      docker start ${CONTAINER_NAME}"
