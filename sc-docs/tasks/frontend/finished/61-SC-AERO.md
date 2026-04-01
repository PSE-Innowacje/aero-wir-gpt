# 61-SC-AERO: OrderFormPage -- base form + pilot + selectors

**Phase**: 4 — Orders
**Depends on**: 59-SC-AERO, 31-SC-AERO
**Ref**: implementation-plan.md § 4.4

## Description

Create the order form page supporting both create and edit modes. The page renders the core order fields including auto-filled pilot information, datetime pickers for planned departure and arrival, and dropdown/multi-select controls for helicopter, crew members, departure site, and arrival site. The helicopter dropdown shows only active helicopters, and crew members are displayed alphabetically.

## Acceptance Criteria

- [ ] Edit mode (`:id` param present) fetches order detail and populates all fields
- [ ] Create mode (`/new`) renders an empty form
- [ ] Pilot field is auto-filled from the logged-in user's linked crew member name and displayed as read-only text
- [ ] Planned departure datetime picker is required
- [ ] Planned arrival datetime picker is required
- [ ] Helicopter selector is a dropdown showing only ACTIVE helicopters, displaying registration number and type
- [ ] Crew members selector is a multi-select with chips, displaying "Imie Nazwisko", sorted alphabetically
- [ ] Departure site is a dropdown populated from landing sites, displaying the site name
- [ ] Arrival site is a dropdown populated from landing sites, displaying the site name
- [ ] "Zapisz" button calls `create` or `update` depending on mode
- [ ] "Powrot do listy" link navigates back to the orders list
- [ ] Routes are registered at `/orders/new` and `/orders/:id`

## Files to Create/Modify

- `frontend/src/pages/orders/OrderFormPage.tsx`
