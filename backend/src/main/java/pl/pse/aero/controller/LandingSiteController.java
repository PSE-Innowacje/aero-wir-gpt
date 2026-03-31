package pl.pse.aero.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pse.aero.dto.LandingSiteRequest;
import pl.pse.aero.dto.LandingSiteResponse;
import pl.pse.aero.service.LandingSiteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@Tag(name = "Landing Sites", description = "Landing site management")
@RestController
@RequestMapping("/api/landing-sites")
public class LandingSiteController {

    private final LandingSiteService landingSiteService;

    public LandingSiteController(LandingSiteService landingSiteService) {
        this.landingSiteService = landingSiteService;
    }

    @Operation(summary = "List landing sites", description = "Returns all landing sites sorted by name")
    @GetMapping
    public ResponseEntity<List<LandingSiteResponse>> list() {
        List<LandingSiteResponse> landingSites = landingSiteService.findAll().stream()
                .map(LandingSiteResponse::from)
                .toList();
        return ResponseEntity.ok(landingSites);
    }

    @Operation(summary = "Get landing site by ID")
    @GetMapping("/{id}")
    public ResponseEntity<LandingSiteResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(LandingSiteResponse.from(landingSiteService.findById(id)));
    }

    @Operation(summary = "Create landing site")
    @ApiResponse(responseCode = "201", description = "Landing site created")
    @PostMapping
    public ResponseEntity<LandingSiteResponse> create(@Valid @RequestBody LandingSiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(LandingSiteResponse.from(landingSiteService.create(request)));
    }

    @Operation(summary = "Update landing site")
    @PutMapping("/{id}")
    public ResponseEntity<LandingSiteResponse> update(@PathVariable String id,
                                                      @Valid @RequestBody LandingSiteRequest request) {
        return ResponseEntity.ok(LandingSiteResponse.from(landingSiteService.update(id, request)));
    }
}
