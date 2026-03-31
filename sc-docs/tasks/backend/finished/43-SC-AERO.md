# 43-SC-AERO: Operations role-based endpoint security

**Phase**: 3 — Operations
**Depends on**: 6-SC-AERO, 41-SC-AERO
**Ref**: implementation-plan.md § 3.4

## Description
Configure role-based access control for all operation endpoints. Planners and supervisors have full read-write access (POST, PUT, status changes, comments). Admins and pilots are restricted to read-only access. Fine-grained action restrictions (which status transitions each role can perform) are enforced in the service layer rather than at the security configuration level.

## Acceptance Criteria
- [ ] PLANNER role: allowed POST, PUT, POST status, POST comments, GET on `/api/operations/**`
- [ ] SUPERVISOR role: allowed POST, PUT, POST status, POST comments, GET on `/api/operations/**`
- [ ] ADMIN role: GET only on `/api/operations/**`; POST/PUT returns 403
- [ ] PILOT role: GET only on `/api/operations/**`; POST/PUT returns 403
- [ ] Status change action restrictions (supervisor-only vs planner-only) remain enforced in service layer
- [ ] Security configured via SecurityConfig or @PreAuthorize annotations on OperationController

## Files to Create/Modify
- backend/src/main/java/pl/pse/aero/config/SecurityConfig.java (modify — add operation endpoint rules)
- backend/src/main/java/pl/pse/aero/controller/OperationController.java (modify — add @PreAuthorize if needed)
