# 8-SC-AERO: DataInitializer — seed 4 default users

**Phase**: 1 — Auth
**Depends on**: 5-SC-AERO
**Ref**: implementation-plan.md § 1.2

## Description
Create a startup data seeder that populates the database with default users for development and testing. The initializer runs on application startup and only inserts users when the users table is empty, preventing duplicates on subsequent restarts. All passwords are hashed with BCrypt via Spring's `PasswordEncoder`.

## Acceptance Criteria
- [ ] `DataInitializer` implements `CommandLineRunner`
- [ ] On startup with empty users table, inserts 4 users:
  - admin@aero.pl / admin — ADMIN
  - planista@aero.pl / planista — PLANNER
  - nadzor@aero.pl / nadzor — SUPERVISOR
  - pilot@aero.pl / pilot — PILOT
- [ ] Passwords are stored as BCrypt hashes using `PasswordEncoder`
- [ ] Second startup does not create duplicate users
- [ ] All 4 users are present in the database after first startup

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/config/DataInitializer.java
