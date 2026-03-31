package pl.pse.aero.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.pse.aero.dto.CrewMemberRequest;
import pl.pse.aero.dto.CrewMemberResponse;
import pl.pse.aero.service.CrewMemberService;

import java.util.List;

@RestController
@RequestMapping("/api/crew-members")
public class CrewMemberController {

    private final CrewMemberService crewMemberService;

    public CrewMemberController(CrewMemberService crewMemberService) {
        this.crewMemberService = crewMemberService;
    }

    @GetMapping
    public ResponseEntity<List<CrewMemberResponse>> list() {
        List<CrewMemberResponse> members = crewMemberService.findAll().stream()
                .map(CrewMemberResponse::from)
                .toList();
        return ResponseEntity.ok(members);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrewMemberResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(CrewMemberResponse.from(crewMemberService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<CrewMemberResponse> create(@Valid @RequestBody CrewMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CrewMemberResponse.from(crewMemberService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CrewMemberResponse> update(@PathVariable String id,
                                                     @Valid @RequestBody CrewMemberRequest request) {
        return ResponseEntity.ok(CrewMemberResponse.from(crewMemberService.update(id, request)));
    }
}
