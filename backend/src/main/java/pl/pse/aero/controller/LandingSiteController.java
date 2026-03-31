package pl.pse.aero.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pse.aero.dto.LandingSiteRequest;
import pl.pse.aero.dto.LandingSiteResponse;
import pl.pse.aero.service.LandingSiteService;

import java.util.List;

@RestController
@RequestMapping("/api/landing-sites")
public class LandingSiteController {

    private final LandingSiteService landingSiteService;

    public LandingSiteController(LandingSiteService landingSiteService) {
        this.landingSiteService = landingSiteService;
    }

    @GetMapping
    public ResponseEntity<List<LandingSiteResponse>> list() {
        List<LandingSiteResponse> landingSites = landingSiteService.findAll().stream()
                .map(LandingSiteResponse::from)
                .toList();
        return ResponseEntity.ok(landingSites);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LandingSiteResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(LandingSiteResponse.from(landingSiteService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<LandingSiteResponse> create(@Valid @RequestBody LandingSiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(LandingSiteResponse.from(landingSiteService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LandingSiteResponse> update(@PathVariable String id,
                                                      @Valid @RequestBody LandingSiteRequest request) {
        return ResponseEntity.ok(LandingSiteResponse.from(landingSiteService.update(id, request)));
    }
}
