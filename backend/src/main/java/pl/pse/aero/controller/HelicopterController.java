package pl.pse.aero.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pse.aero.dto.HelicopterRequest;
import pl.pse.aero.dto.HelicopterResponse;
import pl.pse.aero.service.HelicopterService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@Tag(name = "Helicopters", description = "Helicopter fleet management")
@RestController
@RequestMapping("/api/helicopters")
public class HelicopterController {

    private final HelicopterService helicopterService;

    public HelicopterController(HelicopterService helicopterService) {
        this.helicopterService = helicopterService;
    }

    @Operation(summary = "List helicopters", description = "Returns all helicopters sorted by status then registration number")
    @GetMapping
    public ResponseEntity<List<HelicopterResponse>> list() {
        List<HelicopterResponse> helicopters = helicopterService.findAll().stream()
                .map(HelicopterResponse::from)
                .toList();
        return ResponseEntity.ok(helicopters);
    }

    @Operation(summary = "Get helicopter by ID")
    @GetMapping("/{id}")
    public ResponseEntity<HelicopterResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(HelicopterResponse.from(helicopterService.findById(id)));
    }

    @Operation(summary = "Create helicopter", description = "Active helicopters require an inspection expiry date")
    @ApiResponse(responseCode = "201", description = "Helicopter created")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @PostMapping
    public ResponseEntity<HelicopterResponse> create(@Valid @RequestBody HelicopterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(HelicopterResponse.from(helicopterService.create(request)));
    }

    @Operation(summary = "Update helicopter")
    @PutMapping("/{id}")
    public ResponseEntity<HelicopterResponse> update(@PathVariable String id,
                                                     @Valid @RequestBody HelicopterRequest request) {
        return ResponseEntity.ok(HelicopterResponse.from(helicopterService.update(id, request)));
    }
}
