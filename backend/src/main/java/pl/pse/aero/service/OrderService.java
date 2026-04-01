package pl.pse.aero.service;

import org.springframework.stereotype.Service;
import pl.pse.aero.domain.*;
import pl.pse.aero.repository.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class OrderService {

    private final FlightOrderRepository orderRepository;
    private final HelicopterRepository helicopterRepository;
    private final CrewMemberRepository crewMemberRepository;
    private final FlightOperationRepository operationRepository;
    private final UserRepository userRepository;
    private final OperationService operationService;

    public OrderService(FlightOrderRepository orderRepository,
                        HelicopterRepository helicopterRepository,
                        CrewMemberRepository crewMemberRepository,
                        FlightOperationRepository operationRepository,
                        UserRepository userRepository,
                        OperationService operationService) {
        this.orderRepository = orderRepository;
        this.helicopterRepository = helicopterRepository;
        this.crewMemberRepository = crewMemberRepository;
        this.operationRepository = operationRepository;
        this.userRepository = userRepository;
        this.operationService = operationService;
    }

    public List<FlightOrder> findAll(OrderStatus statusFilter) {
        List<FlightOrder> orders;
        if (statusFilter != null) {
            orders = new ArrayList<>(orderRepository.findByStatus(statusFilter));
        } else {
            orders = new ArrayList<>(orderRepository.findAll());
        }
        orders.sort(Comparator.comparing(
                FlightOrder::getPlannedDeparture,
                Comparator.nullsLast(Comparator.naturalOrder())
        ));
        return orders;
    }

    public FlightOrder findById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Flight order not found: " + id));
    }

    public FlightOrder create(FlightOrder order, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + currentUserEmail));

        if (currentUser.getCrewMemberId() == null) {
            throw new IllegalStateException(
                    "User " + currentUserEmail + " has no linked crew member. Cannot create flight order.");
        }
        order.setPilotId(currentUser.getCrewMemberId());

        validateOperations(order.getOperationIds());

        order.setCrewWeightKg(calculateCrewWeight(order.getPilotId(), order.getCrewMemberIds()));
        order.setEstimatedRouteLengthKm(calculateRouteLength(order.getOperationIds()));

        validateFlightRules(order);

        // Cascade: schedule linked operations
        scheduleOperations(order.getOperationIds());

        order.setStatus(OrderStatus.SUBMITTED);
        order.prePersist();
        return orderRepository.save(order);
    }

    public FlightOrder update(String id, FlightOrder updates, String currentUserEmail) {
        FlightOrder existing = findById(id);

        // Track old operations for unschedule
        List<String> oldOpIds = new ArrayList<>(existing.getOperationIds() != null ? existing.getOperationIds() : List.of());

        existing.setPlannedDeparture(updates.getPlannedDeparture());
        existing.setPlannedArrival(updates.getPlannedArrival());
        existing.setHelicopterId(updates.getHelicopterId());
        existing.setCrewMemberIds(updates.getCrewMemberIds());
        existing.setDepartureSiteId(updates.getDepartureSiteId());
        existing.setArrivalSiteId(updates.getArrivalSiteId());
        existing.setOperationIds(updates.getOperationIds());
        existing.setActualDeparture(updates.getActualDeparture());
        existing.setActualArrival(updates.getActualArrival());

        List<String> newOpIds = existing.getOperationIds() != null ? existing.getOperationIds() : List.of();
        List<String> removed = oldOpIds.stream().filter(id2 -> !newOpIds.contains(id2)).toList();
        List<String> added = newOpIds.stream().filter(id2 -> !oldOpIds.contains(id2)).toList();

        // Only validate newly added operations (existing ones are already SCHEDULED)
        validateOperations(added);

        existing.setCrewWeightKg(calculateCrewWeight(existing.getPilotId(), existing.getCrewMemberIds()));
        existing.setEstimatedRouteLengthKm(calculateRouteLength(existing.getOperationIds()));

        validateFlightRules(existing);

        // Cascade: unschedule removed ops, schedule new ops
        unscheduleOperations(removed);
        scheduleOperations(added);

        existing.prePersist();
        return orderRepository.save(existing);
    }

    // --- Status state machine (55-SC-AERO) ---

    public FlightOrder changeStatus(String orderId, String action, UserRole role, String userEmail) {
        FlightOrder order = findById(orderId);

        switch (action) {
            case "submitForApproval" -> {
                requireRole(role, UserRole.PILOT, action);
                requireOrderStatus(order, OrderStatus.SUBMITTED, action);
                order.setStatus(OrderStatus.SENT_FOR_APPROVAL);
            }
            case "reject" -> {
                requireRole(role, UserRole.SUPERVISOR, action);
                requireOrderStatus(order, OrderStatus.SENT_FOR_APPROVAL, action);
                order.setStatus(OrderStatus.REJECTED);
            }
            case "approve" -> {
                requireRole(role, UserRole.SUPERVISOR, action);
                requireOrderStatus(order, OrderStatus.SENT_FOR_APPROVAL, action);
                order.setStatus(OrderStatus.APPROVED);
            }
            case "partialComplete" -> {
                requireRole(role, UserRole.PILOT, action);
                requireOrderStatus(order, OrderStatus.APPROVED, action);
                requireActualDates(order);
                order.setStatus(OrderStatus.PARTIALLY_COMPLETED);
                cascadeOperationStatus(order.getOperationIds(), "partialComplete", userEmail);
            }
            case "complete" -> {
                requireRole(role, UserRole.PILOT, action);
                requireOrderStatus(order, OrderStatus.APPROVED, action);
                requireActualDates(order);
                order.setStatus(OrderStatus.COMPLETED);
                cascadeOperationStatus(order.getOperationIds(), "complete", userEmail);
            }
            case "notCompleted" -> {
                requireRole(role, UserRole.PILOT, action);
                requireOrderStatus(order, OrderStatus.APPROVED, action);
                order.setStatus(OrderStatus.NOT_COMPLETED);
                cascadeOperationStatus(order.getOperationIds(), "unschedule", userEmail);
            }
            default -> throw new IllegalArgumentException("Unknown action: " + action);
        }

        order.prePersist();
        return orderRepository.save(order);
    }

    // --- 5 validation rules (54-SC-AERO) ---

    void validateFlightRules(FlightOrder order) {
        List<String> errors = new ArrayList<>();
        LocalDate flightDate = order.getPlannedDeparture() != null
                ? order.getPlannedDeparture().toLocalDate() : null;

        if (flightDate == null) return;

        // Rule 1: Helicopter inspection
        Helicopter helicopter = helicopterRepository.findById(order.getHelicopterId())
                .orElseThrow(() -> new NoSuchElementException("Helicopter not found: " + order.getHelicopterId()));

        if (helicopter.getInspectionExpiryDate() != null
                && helicopter.getInspectionExpiryDate().isBefore(flightDate)) {
            errors.add("Przegląd helikoptera wygasa przed datą lotu");
        }

        // Rule 2: Pilot license
        CrewMember pilot = crewMemberRepository.findById(order.getPilotId())
                .orElseThrow(() -> new NoSuchElementException("Pilot not found: " + order.getPilotId()));

        if (pilot.getLicenseExpiryDate() != null
                && pilot.getLicenseExpiryDate().isBefore(flightDate)) {
            errors.add("Licencja pilota wygasa przed datą lotu");
        }

        // Rule 3: Training — pilot + all crew
        if (pilot.getTrainingExpiryDate() != null
                && pilot.getTrainingExpiryDate().isBefore(flightDate)) {
            errors.add("Szkolenie " + pilot.getFirstName() + " " + pilot.getLastName() + " wygasa przed datą lotu");
        }

        if (order.getCrewMemberIds() != null) {
            for (String memberId : order.getCrewMemberIds()) {
                CrewMember member = crewMemberRepository.findById(memberId)
                        .orElseThrow(() -> new NoSuchElementException("Crew member not found: " + memberId));
                if (member.getTrainingExpiryDate() != null
                        && member.getTrainingExpiryDate().isBefore(flightDate)) {
                    errors.add("Szkolenie " + member.getFirstName() + " " + member.getLastName() + " wygasa przed datą lotu");
                }
            }
        }

        // Rule 4: Crew weight
        if (order.getCrewWeightKg() > helicopter.getMaxCrewWeightKg()) {
            errors.add("Waga załogi (" + order.getCrewWeightKg() + " kg) przekracza udźwig helikoptera ("
                    + helicopter.getMaxCrewWeightKg() + " kg)");
        }

        // Rule 5: Route vs range
        if (order.getEstimatedRouteLengthKm() > helicopter.getRangeKm()) {
            errors.add("Szacowana trasa (" + order.getEstimatedRouteLengthKm() + " km) przekracza zasięg helikoptera ("
                    + helicopter.getRangeKm() + " km)");
        }

        if (!errors.isEmpty()) {
            throw new IllegalArgumentException(String.join("; ", errors));
        }
    }

    // --- Cascading (56-SC-AERO) ---

    private void scheduleOperations(List<String> operationIds) {
        if (operationIds == null) return;
        for (String opId : operationIds) {
            operationService.changeStatus(opId, "schedule", null, "system");
        }
    }

    private void unscheduleOperations(List<String> operationIds) {
        if (operationIds == null) return;
        for (String opId : operationIds) {
            operationService.changeStatus(opId, "unschedule", null, "system");
        }
    }

    private void cascadeOperationStatus(List<String> operationIds, String action, String userEmail) {
        if (operationIds == null) return;
        for (String opId : operationIds) {
            operationService.changeStatus(opId, action, null, userEmail);
        }
    }

    // --- Helpers ---

    private void validateOperations(List<String> operationIds) {
        if (operationIds == null || operationIds.isEmpty()) return;
        for (String opId : operationIds) {
            FlightOperation op = operationRepository.findById(opId)
                    .orElseThrow(() -> new NoSuchElementException("Operation not found: " + opId));
            if (op.getStatus() != OperationStatus.CONFIRMED) {
                throw new IllegalArgumentException(
                        "Operation " + opId + " has status " + op.getStatus() +
                                ", but only CONFIRMED operations can be added to an order");
            }
        }
    }

    int calculateCrewWeight(String pilotId, List<String> crewMemberIds) {
        int total = 0;
        CrewMember pilot = crewMemberRepository.findById(pilotId)
                .orElseThrow(() -> new NoSuchElementException("Pilot crew member not found: " + pilotId));
        total += pilot.getWeightKg();

        if (crewMemberIds != null) {
            for (String memberId : crewMemberIds) {
                CrewMember member = crewMemberRepository.findById(memberId)
                        .orElseThrow(() -> new NoSuchElementException("Crew member not found: " + memberId));
                total += member.getWeightKg();
            }
        }
        return total;
    }

    int calculateRouteLength(List<String> operationIds) {
        if (operationIds == null || operationIds.isEmpty()) return 0;
        int total = 0;
        for (String opId : operationIds) {
            FlightOperation op = operationRepository.findById(opId)
                    .orElseThrow(() -> new NoSuchElementException("Operation not found: " + opId));
            total += op.getRouteLengthKm();
        }
        return total;
    }

    private void requireRole(UserRole actual, UserRole required, String action) {
        if (actual != required) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Action '" + action + "' requires role " + required + ", but current role is " + actual);
        }
    }

    private void requireOrderStatus(FlightOrder order, OrderStatus required, String action) {
        if (order.getStatus() != required) {
            throw new IllegalStateException(
                    "Action '" + action + "' requires status " + required + ", but current status is " + order.getStatus());
        }
    }

    private void requireActualDates(FlightOrder order) {
        if (order.getActualDeparture() == null || order.getActualArrival() == null) {
            throw new IllegalArgumentException(
                    "Daty rzeczywistego startu i lądowania są wymagane przed zmianą statusu na zrealizowane");
        }
    }
}
