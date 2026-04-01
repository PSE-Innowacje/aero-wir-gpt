package pl.pse.aero.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pl.pse.aero.domain.FlightOrder;
import pl.pse.aero.domain.OrderStatus;
import pl.pse.aero.domain.UserRole;
import pl.pse.aero.dto.*;
import pl.pse.aero.service.AuthenticationHelper;
import pl.pse.aero.service.OrderService;

import java.util.ArrayList;
import java.util.List;

@Tag(name = "Flight Orders", description = "Flight order management, validation, and status workflows")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final AuthenticationHelper authHelper;

    public OrderController(OrderService orderService, AuthenticationHelper authHelper) {
        this.orderService = orderService;
        this.authHelper = authHelper;
    }

    @Operation(summary = "List orders", description = "Default filter: SENT_FOR_APPROVAL, sorted by plannedDeparture ASC")
    @GetMapping
    public ResponseEntity<List<OrderListResponse>> list(
            @RequestParam(required = false) OrderStatus status) {
        List<OrderListResponse> orders = orderService.findAll(status).stream()
                .map(OrderListResponse::from)
                .toList();
        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "Get order detail", description = "Full order with crew, operations, helicopter, and landing site references")
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(OrderResponse.from(orderService.findById(id)));
    }

    @Operation(summary = "Create flight order", description = "Pilot auto-filled from logged-in user's crew member. Validates 5 flight rules.")
    @ApiResponse(responseCode = "201", description = "Order created")
    @ApiResponse(responseCode = "400", description = "Validation error or flight rule violation")
    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderRequest request,
                                                Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "anonymous";
        FlightOrder order = mapRequestToEntity(request);
        FlightOrder created = orderService.create(order, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(OrderResponse.from(created));
    }

    @Operation(summary = "Update flight order", description = "Recalculates crew weight and route length")
    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> update(@PathVariable String id,
                                                @Valid @RequestBody OrderRequest request,
                                                Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "anonymous";
        FlightOrder updates = mapRequestToEntity(request);
        FlightOrder updated = orderService.update(id, updates, email);
        return ResponseEntity.ok(OrderResponse.from(updated));
    }

    @Operation(summary = "Change order status", description = "Actions: submitForApproval, reject, approve, partialComplete, complete, notCompleted")
    @ApiResponse(responseCode = "200", description = "Status changed")
    @ApiResponse(responseCode = "400", description = "Invalid action or precondition not met")
    @PostMapping("/{id}/status")
    public ResponseEntity<OrderResponse> changeStatus(@PathVariable String id,
                                                      @Valid @RequestBody StatusChangeRequest request,
                                                      Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "anonymous";
        UserRole role = resolveRole(authentication);
        FlightOrder updated = orderService.changeStatus(id, request.getAction(), role, email);
        return ResponseEntity.ok(OrderResponse.from(updated));
    }

    private FlightOrder mapRequestToEntity(OrderRequest request) {
        return FlightOrder.builder()
                .plannedDeparture(request.getPlannedDeparture())
                .plannedArrival(request.getPlannedArrival())
                .pilotId(request.getPilotId())
                .helicopterId(request.getHelicopterId())
                .crewMemberIds(request.getCrewMemberIds() != null ? request.getCrewMemberIds() : new ArrayList<>())
                .departureSiteId(request.getDepartureSiteId())
                .arrivalSiteId(request.getArrivalSiteId())
                .operationIds(request.getOperationIds() != null ? request.getOperationIds() : new ArrayList<>())
                .actualDeparture(request.getActualDeparture())
                .actualArrival(request.getActualArrival())
                .build();
    }

    private UserRole resolveRole(Authentication authentication) {
        return authHelper.resolveRole(authentication);
    }
}
