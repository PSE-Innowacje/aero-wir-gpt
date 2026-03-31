# 37-SC-AERO: FlightOperation embedded lists + all repositories

**Phase**: 3 — Operations
**Depends on**: 35-SC-AERO, 36-SC-AERO
**Ref**: implementation-plan.md § 3.2

## Description
Complete the FlightOperation document by adding the two embedded list fields for activity types and contact emails. Then create all three Spring Data repositories for the operations domain: the main operation repository with custom query methods for filtered listing and sorting, plus repositories for comments and change history.

## Acceptance Criteria
- [ ] `FlightOperation` has embedded list field `Set<ActivityType> activityTypes` stored within the document
- [ ] `FlightOperation` has embedded list field `Set<String> contactEmails` stored within the document
- [ ] `FlightOperationRepository` extends `CouchbaseRepository<FlightOperation, Long>` with methods: `findByStatus(OperationStatus)`, `findByStatusIn(Collection<OperationStatus>)`, and a custom query for list view sorted by `plannedDateEarliest`
- [ ] `OperationCommentRepository` extends `CouchbaseRepository<OperationComment, Long>`
- [ ] `OperationChangeHistoryRepository` extends `CouchbaseRepository<OperationChangeHistory, Long>`
- [ ] All repositories compile successfully
- [ ] Embedded list fields `activityTypes` and `contactEmails` are stored within the FlightOperation document

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/domain/FlightOperation.java (modify — add embedded list fields)
- backend/src/main/java/pl/pse/aero/repository/FlightOperationRepository.java
- backend/src/main/java/pl/pse/aero/repository/OperationCommentRepository.java
- backend/src/main/java/pl/pse/aero/repository/OperationChangeHistoryRepository.java
