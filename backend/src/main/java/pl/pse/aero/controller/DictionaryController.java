package pl.pse.aero.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.pse.aero.domain.*;
import pl.pse.aero.dto.DictionaryEntry;

import java.util.Arrays;
import java.util.List;

@Tag(name = "Dictionaries", description = "Enum lookups with Polish labels for dropdowns and filters")
@RestController
@RequestMapping("/api/dictionaries")
public class DictionaryController {

    @Operation(summary = "Activity types", description = "Returns all flight operation activity types")
    @GetMapping("/activity-types")
    public ResponseEntity<List<DictionaryEntry>> activityTypes() {
        return ResponseEntity.ok(toEntries(ActivityType.values()));
    }

    @Operation(summary = "Crew roles", description = "Returns PILOT and OBSERVER")
    @GetMapping("/crew-roles")
    public ResponseEntity<List<DictionaryEntry>> crewRoles() {
        return ResponseEntity.ok(List.of(
                new DictionaryEntry(CrewRole.PILOT.name(), "Pilot"),
                new DictionaryEntry(CrewRole.OBSERVER.name(), "Obserwator")
        ));
    }

    @Operation(summary = "Operation statuses", description = "Returns all 7 flight operation statuses")
    @GetMapping("/operation-statuses")
    public ResponseEntity<List<DictionaryEntry>> operationStatuses() {
        return ResponseEntity.ok(toEntries(OperationStatus.values()));
    }

    @Operation(summary = "Order statuses", description = "Returns all 7 flight order statuses")
    @GetMapping("/order-statuses")
    public ResponseEntity<List<DictionaryEntry>> orderStatuses() {
        return ResponseEntity.ok(toEntries(OrderStatus.values()));
    }

    private <E extends Enum<E>> List<DictionaryEntry> toEntries(E[] values) {
        return Arrays.stream(values)
                .map(e -> {
                    String label;
                    try {
                        label = (String) e.getClass().getMethod("getLabel").invoke(e);
                    } catch (Exception ex) {
                        label = e.name();
                    }
                    return new DictionaryEntry(e.name(), label);
                })
                .toList();
    }
}
