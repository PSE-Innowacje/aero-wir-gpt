# 48-SC-AERO: OperationFormPage -- base fields + KML upload + map

**Phase**: 3 — Operations
**Depends on**: 45-SC-AERO, 46-SC-AERO, 31-SC-AERO
**Ref**: implementation-plan.md § 3.6

## Description

Create the operation form page supporting both create and edit modes. The page renders all base fields for a flight operation, provides KML file upload with immediate map preview of the parsed route, and displays the calculated route length. In edit mode, existing KML points are loaded from the API response and rendered on the map.

## Acceptance Criteria

- [ ] Edit mode (`:id` param present) fetches operation detail and populates all fields
- [ ] Create mode (`/new`) renders an empty form
- [ ] Base fields render correctly: Nr operacji (read-only in edit), Nr zlecenia/projektu (TextField max 30), Opis skrocony (TextField max 100), Proponowane daty najwczesniej/najpozniej (two DatePickers), Dodatkowe informacje (TextField multiline max 500), Planowane daty najwczesniej/najpozniej (two DatePickers), Uwagi po realizacji (TextField multiline max 500), Status (read-only StatusBadge), Osoba wprowadzajaca (read-only in edit)
- [ ] KML section includes a file upload input accepting `.kml` files
- [ ] On KML upload, `uploadKml(file)` is called and the result (filePath, points, routeLengthKm) is stored in local state
- [ ] Route length is displayed as "Dlugosc trasy: X km" after upload
- [ ] MapView renders the uploaded or loaded kmlPoints as a polyline
- [ ] "Zapisz" button calls `create` or `update` depending on mode
- [ ] "Powrot do listy" link navigates back to the operations list
- [ ] Routes are registered at `/operations/new` and `/operations/:id`

## Files to Create/Modify

- `frontend/src/pages/operations/OperationFormPage.tsx`
