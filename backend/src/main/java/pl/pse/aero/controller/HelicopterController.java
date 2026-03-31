package pl.pse.aero.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pse.aero.dto.HelicopterRequest;
import pl.pse.aero.dto.HelicopterResponse;
import pl.pse.aero.service.HelicopterService;

import java.util.List;

@RestController
@RequestMapping("/api/helicopters")
public class HelicopterController {

    private final HelicopterService helicopterService;

    public HelicopterController(HelicopterService helicopterService) {
        this.helicopterService = helicopterService;
    }

    @GetMapping
    public ResponseEntity<List<HelicopterResponse>> list() {
        List<HelicopterResponse> helicopters = helicopterService.findAll().stream()
                .map(HelicopterResponse::from)
                .toList();
        return ResponseEntity.ok(helicopters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HelicopterResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(HelicopterResponse.from(helicopterService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<HelicopterResponse> create(@Valid @RequestBody HelicopterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(HelicopterResponse.from(helicopterService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HelicopterResponse> update(@PathVariable String id,
                                                     @Valid @RequestBody HelicopterRequest request) {
        return ResponseEntity.ok(HelicopterResponse.from(helicopterService.update(id, request)));
    }
}
