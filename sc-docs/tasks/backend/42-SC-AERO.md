# 42-SC-AERO: KML upload + download endpoints

**Phase**: 3 — Operations
**Depends on**: 33-SC-AERO, 41-SC-AERO
**Ref**: implementation-plan.md § 3.1

## Description
Add KML file upload and download endpoints. The upload endpoint is called before creating an operation: the frontend uploads the KML file, receives the parsed result (file path, extracted points, calculated route length), and then submits the operation form with that data. The download endpoint serves the stored KML file for raw download with the correct content type.

## Acceptance Criteria
- [ ] `POST /api/operations/upload-kml` accepts multipart file upload, calls `KmlService.saveAndParse()`, returns `KmlProcessingResult` (filePath, points, routeLengthKm)
- [ ] `GET /api/operations/{id}/kml` serves the stored KML file with Content-Type `application/vnd.google-earth.kml+xml`
- [ ] Upload with valid KML returns points list and route length in km
- [ ] Upload with invalid KML returns 400 with descriptive error
- [ ] Download for non-existent operation returns 404
- [ ] Upload endpoint is called independently before the create operation endpoint

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/controller/OperationController.java (modify — add upload and download endpoints)
