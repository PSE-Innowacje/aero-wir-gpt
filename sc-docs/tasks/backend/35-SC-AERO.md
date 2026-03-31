# 35-SC-AERO: FlightOperation entity + kml_points JSON

**Phase**: 3 — Operations
**Depends on**: 5-SC-AERO, 34-SC-AERO
**Ref**: implementation-plan.md § 3.2

## Description
Create the core `FlightOperation` JPA entity with all fields specified in PRD section 6.5. The entity stores KML route data as a JSON array of [lat,lng] pairs in a TEXT column, avoiding a separate points table. The entity's `id` doubles as the display number (`auto_number`). Activity types and contacts are stored via join tables defined in the next task. Timestamps are auto-managed.

## Acceptance Criteria
- [ ] `FlightOperation` entity has all fields: id (Long PK), orderNumber (varchar 30), shortDescription (varchar 100), kmlFilePath (varchar 500), kmlPoints (TEXT, stores JSON array of [lat,lng]), proposedDateEarliest (LocalDate, nullable), proposedDateLatest (LocalDate, nullable), additionalInfo (varchar 500, nullable), routeLengthKm (int), plannedDateEarliest (LocalDate, nullable), plannedDateLatest (LocalDate, nullable), status (OperationStatus, @Enumerated STRING, default SUBMITTED), createdByEmail (varchar 100), postCompletionNotes (varchar 500, nullable), createdAt (LocalDateTime), updatedAt (LocalDateTime)
- [ ] Entity `id` serves as the display number (no separate auto_number field)
- [ ] Activity types and contacts fields are declared but mapped via join tables (task 37)
- [ ] `createdAt` and `updatedAt` are auto-managed via @PrePersist / @PreUpdate
- [ ] Backend compiles successfully
- [ ] `flight_operations` table is created on application startup with all columns including `kml_points`

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/domain/FlightOperation.java
