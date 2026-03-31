package pl.pse.aero.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pl.pse.aero.domain.FlightOperation;
import pl.pse.aero.domain.OperationStatus;
import pl.pse.aero.domain.UserRole;
import pl.pse.aero.dto.*;
import pl.pse.aero.repository.UserRepository;
import pl.pse.aero.service.KmlService;
import pl.pse.aero.service.OperationService;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Tag(name = "Flight Operations", description = "Flight operation management and status workflows")
@RestController
@RequestMapping("/api/operations")
public class OperationController {

    private final OperationService operationService;
    private final KmlService kmlService;
    private final UserRepository userRepository;

    public OperationController(OperationService operationService, KmlService kmlService,
                               UserRepository userRepository) {
        this.operationService = operationService;
        this.kmlService = kmlService;
        this.userRepository = userRepository;
    }

    @Operation(summary = "List operations", description = "Returns operations filtered by status (default: CONFIRMED), sorted by plannedDateEarliest ASC")
    @GetMapping
    public ResponseEntity<List<OperationListResponse>> list(
            @RequestParam(required = false) OperationStatus status) {
        OperationStatus filter = status != null ? status : OperationStatus.CONFIRMED;
        List<OperationListResponse> ops = operationService.findAll(filter).stream()
                .map(OperationListResponse::from)
                .toList();
        return ResponseEntity.ok(ops);
    }

    @Operation(summary = "Get operation detail", description = "Returns full operation with comments, history, KML points, and linked orders")
    @GetMapping("/{id}")
    public ResponseEntity<OperationResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(OperationResponse.from(operationService.findById(id)));
    }

    @Operation(summary = "Create operation")
    @ApiResponse(responseCode = "201", description = "Operation created")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @PostMapping
    public ResponseEntity<OperationResponse> create(@Valid @RequestBody OperationRequest request,
                                                    Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "anonymous";
        FlightOperation op = mapRequestToEntity(request);
        FlightOperation created = operationService.create(op, null, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(OperationResponse.from(created));
    }

    @Operation(summary = "Update operation", description = "Role-based field restrictions apply")
    @PutMapping("/{id}")
    public ResponseEntity<OperationResponse> update(@PathVariable String id,
                                                    @Valid @RequestBody OperationRequest request,
                                                    Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "anonymous";
        UserRole role = resolveRole(authentication);
        FlightOperation updates = mapRequestToEntity(request);
        FlightOperation updated = operationService.update(id, updates, role, email);
        return ResponseEntity.ok(OperationResponse.from(updated));
    }

    @Operation(summary = "Change operation status", description = "Actions: reject, confirm, cancel")
    @ApiResponse(responseCode = "200", description = "Status changed")
    @ApiResponse(responseCode = "400", description = "Invalid action or precondition not met")
    @PostMapping("/{id}/status")
    public ResponseEntity<OperationResponse> changeStatus(@PathVariable String id,
                                                          @Valid @RequestBody StatusChangeRequest request,
                                                          Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "anonymous";
        UserRole role = resolveRole(authentication);
        FlightOperation updated = operationService.changeStatus(id, request.getAction(), role, email);
        return ResponseEntity.ok(OperationResponse.from(updated));
    }

    @Operation(summary = "Add comment to operation")
    @ApiResponse(responseCode = "200", description = "Comment added")
    @PostMapping("/{id}/comments")
    public ResponseEntity<Void> addComment(@PathVariable String id,
                                           @Valid @RequestBody CommentRequest request,
                                           Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "anonymous";
        operationService.addComment(id, request.getContent(), email);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Upload KML file", description = "Parse and validate KML, returns points and route length")
    @ApiResponse(responseCode = "200", description = "KML processed successfully")
    @ApiResponse(responseCode = "400", description = "Invalid KML file")
    @PostMapping("/upload-kml")
    public ResponseEntity<KmlProcessingResult> uploadKml(@RequestParam("file") MultipartFile file) {
        KmlProcessingResult result = kmlService.saveAndParse(file);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Download KML file", description = "Serves the stored KML file for an operation")
    @ApiResponse(responseCode = "200", description = "KML file")
    @ApiResponse(responseCode = "404", description = "Operation or KML file not found")
    @GetMapping("/{id}/kml")
    public ResponseEntity<Resource> downloadKml(@PathVariable String id) {
        FlightOperation op = operationService.findById(id);
        if (op.getKmlFilePath() == null) {
            return ResponseEntity.notFound().build();
        }
        Path path = Path.of(op.getKmlFilePath());
        if (!path.toFile().exists()) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(path);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.google-earth.kml+xml"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + path.getFileName() + "\"")
                .body(resource);
    }

    private FlightOperation mapRequestToEntity(OperationRequest request) {
        return FlightOperation.builder()
                .orderNumber(request.getOrderNumber())
                .shortDescription(request.getShortDescription())
                .activityTypes(request.getActivityTypes() != null ? request.getActivityTypes() : new ArrayList<>())
                .proposedDateEarliest(request.getProposedDateEarliest())
                .proposedDateLatest(request.getProposedDateLatest())
                .additionalInfo(request.getAdditionalInfo())
                .plannedDateEarliest(request.getPlannedDateEarliest())
                .plannedDateLatest(request.getPlannedDateLatest())
                .contacts(request.getContacts() != null ? request.getContacts() : new ArrayList<>())
                .postCompletionNotes(request.getPostCompletionNotes())
                .kmlFilePath(request.getKmlFilePath())
                .kmlPoints(request.getKmlPoints())
                .routeLengthKm(request.getRouteLengthKm() != null ? request.getRouteLengthKm() : 0)
                .build();
    }

    private UserRole resolveRole(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName())
                .map(u -> u.getRole())
                .orElse(null);
    }
}
