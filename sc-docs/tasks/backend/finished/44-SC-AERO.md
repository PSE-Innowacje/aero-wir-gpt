# 44-SC-AERO: Synthetic KML test data + DataInitializer extension

**Phase**: 3 — Operations
**Depends on**: 33-SC-AERO, 15-SC-AERO, 19-SC-AERO, 23-SC-AERO
**Ref**: implementation-plan.md § 3.7, § 3.8

## Description
Create synthetic KML test files with realistic Polish geographic data and extend the DataInitializer to seed a complete demo dataset. The test KML files cover three route profiles (short urban, medium regional, long cross-country). The seeder populates helicopters, crew members, landing sites with real Polish airfield coordinates, and flight operations in various statuses. It also links the pilot@aero.pl test user to a pilot crew member via crewMemberId.

## Acceptance Criteria
- [ ] `route-warsaw-short.kml` created: ~50 points, ~20km route, around Warsaw (52.2N, 21.0E)
- [ ] `route-south-medium.kml` created: ~200 points, ~80km route, southern Poland (~50.0N, 20.0E)
- [ ] `route-cross-long.kml` created: ~1000 points, ~200km route, crossing multiple regions
- [ ] All KML files are valid XML with proper `<Placemark>` and `<coordinates>` structure
- [ ] DataInitializer seeds 2 active + 1 inactive helicopters (only if helicopters table is empty)
- [ ] DataInitializer seeds 2 crew members with role PILOT + 2 with role OBSERVER
- [ ] DataInitializer seeds 3 landing sites with real Polish airfield coordinates (Babice EPBC, Modlin EPMO, Radom EPRA)
- [ ] DataInitializer seeds 3-5 flight operations in various statuses (SUBMITTED, CONFIRMED, REJECTED) with KML files copied from test-data
- [ ] pilot@aero.pl user is linked to one of the pilot crew members via crewMemberId
- [ ] Fresh startup seeds all demo data; map shows KML routes; operations list has entries

## Files to Create/Modify
- backend/src/main/resources/test-data/route-warsaw-short.kml
- backend/src/main/resources/test-data/route-south-medium.kml
- backend/src/main/resources/test-data/route-cross-long.kml
- backend/src/main/java/pl/pse/aero/config/DataInitializer.java (modify — extend with helicopters, crew, sites, operations)
