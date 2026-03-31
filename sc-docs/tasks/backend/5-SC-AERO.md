# 5-SC-AERO: User entity + UserRole enum + UserRepository

**Phase**: 1 — Auth
**Depends on**: 2-SC-AERO
**Ref**: implementation-plan.md § 1.1

## Description
Create the core user domain model. Define a `UserRole` enum with the four application roles. Create a `User` JPA entity with identity, personal info, authentication, and role fields. The entity includes an optional foreign key reference to `crew_members` (the actual FK constraint will be set later when the CrewMember entity exists). Provide a Spring Data repository with an email lookup method for authentication.

## Acceptance Criteria
- [ ] `UserRole` enum defines: ADMIN, PLANNER, SUPERVISOR, PILOT
- [ ] `User` entity has fields: id (Long, auto-generated), firstName, lastName, email (unique), passwordHash, role (UserRole, @Enumerated STRING), crewMemberId (Long, nullable)
- [ ] `UserRepository` extends `JpaRepository<User, Long>` with `Optional<User> findByEmail(String email)`
- [ ] Backend compiles successfully
- [ ] JPA auto-creates `users` table on application startup

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/domain/UserRole.java
- backend/src/main/java/com/nullterrier/aero/domain/User.java
- backend/src/main/java/com/nullterrier/aero/repository/UserRepository.java
