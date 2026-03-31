# 30-SC-AERO: DictionaryController — all lookups

**Phase**: 2 — Admin CRUD
**Depends on**: 2-SC-AERO
**Ref**: implementation-plan.md § 2.7

## Description
Create a single controller that exposes all enum-based lookup data as REST endpoints. Each endpoint returns an array of value-label pairs where the value is the enum constant name and the label is the Polish-language display text. This allows the frontend to populate dropdowns and filters without hardcoding enum values.

## Acceptance Criteria
- [ ] `DictionaryEntry` DTO has fields: value (String), label (String)
- [ ] `GET /api/dictionaries/activity-types` returns all ActivityType enum values with Polish labels
- [ ] `GET /api/dictionaries/crew-roles` returns PILOT and OBSERVER with Polish labels
- [ ] `GET /api/dictionaries/operation-statuses` returns all 7 operation statuses with Polish labels
- [ ] `GET /api/dictionaries/order-statuses` returns all 7 order statuses with Polish labels
- [ ] Each endpoint returns a JSON array of `{value, label}` objects

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/dto/DictionaryEntry.java
- backend/src/main/java/com/nullterrier/aero/controller/DictionaryController.java
