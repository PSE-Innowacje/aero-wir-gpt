# 34-SC-AERO: OperationStatus + ActivityType enums

**Phase**: 3 — Operations
**Depends on**: 2-SC-AERO
**Ref**: implementation-plan.md § 3.2

## Description
Create the two enums required by the flight operations domain. `OperationStatus` defines the seven lifecycle states with integer codes and Polish display labels. `ActivityType` defines the five kinds of drone/helicopter work, each with a Polish label. Both enums provide a `getLabel()` accessor for UI display, and `OperationStatus` adds a `fromCode(int)` factory method for mapping from integer codes.

## Acceptance Criteria
- [ ] `OperationStatus` enum defines: SUBMITTED(1), REJECTED(2), CONFIRMED(3), SCHEDULED(4), PARTIALLY_COMPLETED(5), COMPLETED(6), CANCELLED(7) — each with int code and Polish label
- [ ] `ActivityType` enum defines: VISUAL_INSPECTION, SCAN_3D, FAULT_LOCATION, PHOTOS, PATROL — each with Polish label ("oględziny wizualne", "skan 3D", "lokalizacja awarii", "zdjęcia", "patrolowanie")
- [ ] `getLabel()` returns the Polish display text on both enums
- [ ] `OperationStatus.fromCode(int)` returns the matching enum constant or throws for unknown codes
- [ ] Both enums compile successfully

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/domain/OperationStatus.java
- backend/src/main/java/pl/pse/aero/domain/ActivityType.java
