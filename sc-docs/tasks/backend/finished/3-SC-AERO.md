# 3-SC-AERO: Docker Compose for Couchbase

**Phase**: 0 — Scaffolding
**Depends on**: 1-SC-AERO
**Ref**: implementation-plan.md § 0.3

## Description
Create a Docker Compose file at the project root that runs Couchbase Server with the bucket, user, and password matching the backend application configuration. Use a named volume for data persistence. Update `.gitignore` to exclude the uploads directory and docker volume data.

## Acceptance Criteria
- [ ] `docker-compose.yml` exists at project root with Couchbase Server service
- [ ] Couchbase is configured with ports 8091-8096 and 11210, bucket: aero, user: aero, password: aeropass
- [ ] A named volume is used for Couchbase data persistence
- [ ] `.gitignore` includes `uploads/` and docker volume entries
- [ ] `docker compose up -d` starts Couchbase successfully
- [ ] Couchbase Web Console accessible at http://localhost:8091
- [ ] `./gradlew :backend:bootRun` starts successfully with Couchbase running

## Files to Create/Modify
- docker-compose.yml
- .gitignore
