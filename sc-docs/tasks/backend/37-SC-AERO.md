# 37-SC-AERO: FlightOperation join tables + all repositories

**Phase**: 3 — Operations
**Depends on**: 35-SC-AERO, 36-SC-AERO
**Ref**: implementation-plan.md § 3.2

## Description
Complete the FlightOperation entity by adding the two `@ElementCollection` mappings for activity types and contact emails, each backed by a JPA-generated join table. Then create all three Spring Data repositories for the operations domain: the main operation repository with custom query methods for filtered listing and sorting, plus repositories for comments and change history.

## Acceptance Criteria
- [ ] `FlightOperation` has `@ElementCollection Set<ActivityType> activityTypes` mapped to `flight_operation_activity_types` join table
- [ ] `FlightOperation` has `@ElementCollection Set<String> contactEmails` mapped to `flight_operation_contacts` join table
- [ ] `FlightOperationRepository` extends `JpaRepository<FlightOperation, Long>` with methods: `findByStatus(OperationStatus)`, `findByStatusIn(Collection<OperationStatus>)`, and a custom query for list view sorted by `plannedDateEarliest`
- [ ] `OperationCommentRepository` extends `JpaRepository<OperationComment, Long>`
- [ ] `OperationChangeHistoryRepository` extends `JpaRepository<OperationChangeHistory, Long>`
- [ ] All repositories compile successfully
- [ ] Join tables `flight_operation_activity_types` and `flight_operation_contacts` are created on startup

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/domain/FlightOperation.java (modify — add @ElementCollection fields)
- backend/src/main/java/com/nullterrier/aero/repository/FlightOperationRepository.java
- backend/src/main/java/com/nullterrier/aero/repository/OperationCommentRepository.java
- backend/src/main/java/com/nullterrier/aero/repository/OperationChangeHistoryRepository.java
