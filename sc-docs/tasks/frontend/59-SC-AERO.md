# 59-SC-AERO: Order types + API functions

**Phase**: 4 — Orders
**Depends on**: 9-SC-AERO
**Ref**: implementation-plan.md § 4.4

## Description

Define all TypeScript types for the flight orders domain and implement the corresponding API functions. The types must mirror the backend DTOs exactly, including nested objects for pilot, helicopter, crew members, landing sites, and linked operations. The API layer provides typed functions for CRUD operations and status transitions.

## Acceptance Criteria

- [ ] `FlightOrder` interface includes all fields: id, plannedDeparture, plannedArrival, pilot ({id, firstName, lastName}), status, helicopter ({id, registrationNumber, type}), crewMembers ({id, firstName, lastName, weightKg}[]), crewWeightKg, departureSite ({id, name, latitude, longitude}), arrivalSite (same shape), operations ({id, orderNumber, shortDescription, routeLengthKm, kmlPoints}[]), estimatedRouteLengthKm, actualDeparture, actualArrival
- [ ] `OrderRequest` interface includes: plannedDeparture, plannedArrival, helicopterId, crewMemberIds, departureSiteId, arrivalSiteId, operationIds, actualDeparture, actualArrival
- [ ] `OrderListItem` interface includes: id, plannedDeparture, helicopterRegistration, pilotName, status
- [ ] `getAll(params?)` supports optional status filter
- [ ] `getById(id)` returns a fully typed `FlightOrder`
- [ ] `create(req)` and `update(id, req)` accept `OrderRequest`
- [ ] `changeStatus(id, action)` sends the status transition action
- [ ] All types match backend DTOs including nested objects
- [ ] All API functions use the shared Axios instance and are fully typed

## Files to Create/Modify

- `frontend/src/types/order.ts`
- `frontend/src/api/orders.ts`
