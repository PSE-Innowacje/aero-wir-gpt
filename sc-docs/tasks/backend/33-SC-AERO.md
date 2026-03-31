# 33-SC-AERO: KmlService — parse, validate, Haversine

**Phase**: 3 — Operations
**Depends on**: 2-SC-AERO
**Ref**: implementation-plan.md § 3.1

## Description
Create the KML file processing service. The `saveAndParse(MultipartFile)` method saves the uploaded file to disk using a UUID-prefixed filename, parses the XML to extract coordinate triplets from all `<Placemark>` nodes, validates point count (max 5000) and geographic bounds (Poland bounding box), calculates total route length using the Haversine formula on consecutive points, and returns a result record with the file path, parsed points, and route length in km. Create a `KmlProcessingResult` record to carry the processing output.

## Acceptance Criteria
- [ ] `KmlService` is created in the service package with `saveAndParse(MultipartFile)` method
- [ ] Uploaded file saved to `{upload-dir}/{UUID}_{originalFilename}.kml`
- [ ] XML parsing uses `javax.xml.parsers.DocumentBuilder` to extract `<coordinates>` text from all `<Placemark>` nodes, parsing "lng,lat,alt" triplets
- [ ] Validation rejects files with more than 5000 points (throws clear error)
- [ ] Validation rejects points outside Poland bounding box (lat 49.0-54.9, lng 14.1-24.2) with clear error
- [ ] Route length calculated via Haversine formula on consecutive points, summed in km, rounded to integer
- [ ] `KmlProcessingResult` record contains: filePath (String), points (List<double[]> as lat,lng pairs), routeLengthKm (int)
- [ ] Malformed XML throws a clear, descriptive error message

## Files to Create/Modify
- backend/src/main/java/com/nullterrier/aero/service/KmlService.java
- backend/src/main/java/com/nullterrier/aero/dto/KmlProcessingResult.java
