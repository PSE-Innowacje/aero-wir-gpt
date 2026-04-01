# IMP-08-SC-AERO: Store KML files as binary in MongoDB instead of filesystem

**Phase**: Improvement
**Depends on**: 33-SC-AERO, 35-SC-AERO, 42-SC-AERO
**Ref**: Security audit findings #6, #7 (path traversal)

## Description
Replace filesystem-based KML file storage with binary storage directly in MongoDB on the `FlightOperation` document. The current implementation saves KML files to disk using `{upload-dir}/{UUID}_{originalFilename}.kml` and stores the path in `kmlFilePath`. This creates path traversal vulnerabilities (attacker-controlled filenames and client-settable `kmlFilePath` in the DTO) and requires a persistent filesystem volume for deployment.

Store the raw KML bytes and original filename as fields on `FlightOperation`. Remove `kmlFilePath` and the filesystem save/serve logic. The upload endpoint parses the KML (extracting points and route length as before) and stores the raw file content. The download endpoint serves the bytes from the document.

KML files are small (PRD caps at 5000 points ≈ ~100KB max, well within MongoDB's 16MB document limit).

## Acceptance Criteria
- [ ] `FlightOperation` replaces `kmlFilePath` (String) with `kmlFileContent` (byte[]) and `kmlFileName` (String)
- [ ] `KmlService.saveAndParse(MultipartFile)` no longer writes to the filesystem — returns parsed points + route length + raw bytes
- [ ] `KmlProcessingResult` updated: replaces `filePath` with `fileContent` (byte[]) and `fileName` (String)
- [ ] `POST /api/operations/upload-kml` returns points, routeLengthKm, and fileName (not file path)
- [ ] `GET /api/operations/{id}/kml` serves `kmlFileContent` from the document with correct content type and filename header
- [ ] `OperationRequest` DTO no longer accepts `kmlFilePath` — KML data is only set server-side via upload
- [ ] `OperationResponse` includes `kmlFileName` (not file path) and `kmlPoints`
- [ ] No filesystem `uploads/` directory is needed — remove `app.upload-dir` from `application.yml`
- [ ] Path traversal vulnerabilities eliminated (security findings #6 and #7 resolved)
- [ ] Existing Spock tests for KmlService updated (no temp directory needed for file save)
- [ ] `DataInitializer` updated to store KML bytes from classpath resources directly in documents
- [ ] Backend compiles and all tests pass

## Files to Modify
- `domain/FlightOperation.java` — replace `kmlFilePath` with `kmlFileContent` + `kmlFileName`
- `service/KmlService.java` — remove filesystem save, return bytes in result
- `dto/KmlProcessingResult.java` — replace `filePath` with `fileContent` + `fileName`
- `dto/OperationRequest.java` — remove `kmlFilePath` field
- `dto/OperationResponse.java` — replace `kmlFilePath` with `kmlFileName`
- `controller/OperationController.java` — update upload/download endpoints
- `config/DataInitializer.java` — store KML bytes from classpath
- `application.yml` — remove `app.upload-dir`
- `test/.../KmlServiceSpec.groovy` — update tests
