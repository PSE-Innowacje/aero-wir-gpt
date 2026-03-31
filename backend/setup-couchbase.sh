#!/usr/bin/env bash
# Sets up a Couchbase 7.6.1 container for local AERO development.
# Run once: bash backend/setup-couchbase.sh
# After that, just start it: docker start aero-couchbase

set -euo pipefail

CONTAINER_NAME="aero-couchbase"
IMAGE="couchbase/server:7.6.1"
ADMIN_USER="admin"
ADMIN_PASS="admin1"
APP_USER="aero"
APP_PASS="aeropass"
BUCKET="aero"

echo ">>> Starting Couchbase container..."
docker run -d --name "$CONTAINER_NAME" \
  -p 8091-8096:8091-8096 \
  -p 11210:11210 \
  "$IMAGE"

echo ">>> Waiting for Couchbase to be ready..."
until curl -sf http://localhost:8091/ui/index.html > /dev/null 2>&1; do
  sleep 2
  printf "."
done
echo " ready."

echo ">>> Initializing cluster..."
curl -sf -X POST http://localhost:8091/clusterInit \
  -d "hostname=127.0.0.1" \
  -d "dataPath=%2Fopt%2Fcouchbase%2Fvar%2Flib%2Fcouchbase%2Fdata" \
  -d "indexPath=%2Fopt%2Fcouchbase%2Fvar%2Flib%2Fcouchbase%2Fdata" \
  -d "services=kv%2Cn1ql%2Cindex" \
  -d "memoryQuota=256" \
  -d "indexMemoryQuota=256" \
  -d "username=${ADMIN_USER}" \
  -d "password=${ADMIN_PASS}" \
  -d "port=SAME" > /dev/null

echo ">>> Creating bucket '${BUCKET}'..."
curl -sf -X POST http://localhost:8091/pools/default/buckets \
  -u "${ADMIN_USER}:${ADMIN_PASS}" \
  -d "name=${BUCKET}" \
  -d "bucketType=couchbase" \
  -d "ramQuota=128" > /dev/null

echo ">>> Creating application user '${APP_USER}'..."
curl -sf -X PUT "http://localhost:8091/settings/rbac/users/local/${APP_USER}" \
  -u "${ADMIN_USER}:${ADMIN_PASS}" \
  -d "password=${APP_PASS}" \
  -d "roles=bucket_full_access[${BUCKET}]" > /dev/null

echo ""
echo "=== Couchbase is ready ==="
echo "  Web Console: http://localhost:8091  (admin / admin1)"
echo "  App connects: localhost:8091  (aero / aeropass, bucket: aero)"
echo ""
echo "Run the backend:  ./gradlew :backend:bootRun"
echo "Stop Couchbase:   docker stop aero-couchbase"
echo "Start again:      docker start aero-couchbase"
