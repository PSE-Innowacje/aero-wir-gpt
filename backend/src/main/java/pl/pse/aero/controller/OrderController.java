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
import pl.pse.aero.repository.UserRepository;
import pl.pse.aero.service.OrderService;

import java.util.ArrayList;
import java.util.List;

@Tag(name = "Flight Orders", description = "Flight order management, validation, and status workflows")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @Operation(summary = "List orders", description = "Default filter: SENT_FOR_APPROVAL, sorted by plannedDeparture ASC")
    @GetMapping
    public ResponseEntity<List<OrderListResponse>> list(
            @RequestParam(required = false) OrderStatus status) {
        OrderStatus filter = status != null ? status : OrderStatus.SENT_FOR_APPROVAL;
        List<OrderListResponse> orders = orderService.findAll(filter).stream()
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
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName())
                .map(u -> u.getRole())
                .orElse(null);
    }
}
