package pl.pse.aero.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pse.aero.dto.CrewMemberRequest;
import pl.pse.aero.dto.CrewMemberResponse;
import pl.pse.aero.service.CrewMemberService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@Tag(name = "Crew Members", description = "Crew member management")
@RestController
@RequestMapping("/api/crew-members")
public class CrewMemberController {

    private final CrewMemberService crewMemberService;

    public CrewMemberController(CrewMemberService crewMemberService) {
        this.crewMemberService = crewMemberService;
    }

    @Operation(summary = "List crew members", description = "Returns all crew members sorted by email")
    @GetMapping
    public ResponseEntity<List<CrewMemberResponse>> list() {
        List<CrewMemberResponse> members = crewMemberService.findAll().stream()
                .map(CrewMemberResponse::from)
                .toList();
        return ResponseEntity.ok(members);
    }

    @Operation(summary = "Get crew member by ID")
    @GetMapping("/{id}")
    public ResponseEntity<CrewMemberResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(CrewMemberResponse.from(crewMemberService.findById(id)));
    }

    @Operation(summary = "Create crew member", description = "Pilots require license number and expiry date")
    @ApiResponse(responseCode = "201", description = "Crew member created")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @PostMapping
    public ResponseEntity<CrewMemberResponse> create(@Valid @RequestBody CrewMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CrewMemberResponse.from(crewMemberService.create(request)));
    }

    @Operation(summary = "Update crew member")
    @PutMapping("/{id}")
    public ResponseEntity<CrewMemberResponse> update(@PathVariable String id,
                                                     @Valid @RequestBody CrewMemberRequest request) {
        return ResponseEntity.ok(CrewMemberResponse.from(crewMemberService.update(id, request)));
    }
}
