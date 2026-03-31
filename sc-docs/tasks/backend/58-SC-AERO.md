# 58-SC-AERO: Orders role-based endpoint security

**Phase**: 4 — Orders
**Depends on**: 6-SC-AERO, 57-SC-AERO
**Ref**: implementation-plan.md § 4.3

## Description
Configure role-based access control for all order endpoints. Pilots have full access as the primary order creators and managers. Supervisors can read, update, and change statuses but cannot create new orders. Admins are restricted to read-only access. Planners are completely locked out of the orders domain with 403 on all endpoints.

## Acceptance Criteria
- [ ] PILOT role: full access — GET, POST, PUT, POST status on `/api/orders/**`
- [ ] SUPERVISOR role: GET, PUT, POST status only — POST (create) returns 403
- [ ] ADMIN role: GET only — POST, PUT, POST status return 403
- [ ] PLANNER role: 403 on ALL `/api/orders/**` endpoints (including GET)
- [ ] Security configured via SecurityConfig or @PreAuthorize annotations on OrderController

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/config/SecurityConfig.java (modify — add order endpoint rules)
- backend/src/main/java/com/nullterrier/aero/controller/OrderController.java (modify — add @PreAuthorize if needed)
