# 3-SC-AERO: Docker Compose for PostgreSQL

**Phase**: 0 — Scaffolding
**Depends on**: 1-SC-AERO
**Ref**: implementation-plan.md § 0.3

## Description
Create a Docker Compose file at the project root that runs PostgreSQL 16 with the database, user, and password matching the backend application configuration. Use a named volume for data persistence. Update `.gitignore` to exclude the uploads directory and docker volume data.

## Acceptance Criteria
- [ ] `docker-compose.yml` exists at project root with PostgreSQL 16 service
- [ ] Postgres is configured with port 5432, database: aero, user: aero, password: aero
- [ ] A named volume is used for PostgreSQL data persistence
- [ ] `.gitignore` includes `uploads/` and docker volume entries
- [ ] `docker compose up -d` starts PostgreSQL successfully
- [ ] `psql -h localhost -U aero -d aero` connects to the database
- [ ] `./gradlew :backend:bootRun` starts successfully with the database running

## Files to Create/Modify
- docker-compose.yml
- .gitignore
