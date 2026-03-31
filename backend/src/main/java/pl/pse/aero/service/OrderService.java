package pl.pse.aero.service;

import org.springframework.stereotype.Service;
import pl.pse.aero.domain.*;
import pl.pse.aero.repository.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class OrderService {

    private final FlightOrderRepository orderRepository;
    private final CrewMemberRepository crewMemberRepository;
    private final FlightOperationRepository operationRepository;
    private final UserRepository userRepository;

    public OrderService(FlightOrderRepository orderRepository,
                        CrewMemberRepository crewMemberRepository,
                        FlightOperationRepository operationRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.crewMemberRepository = crewMemberRepository;
        this.operationRepository = operationRepository;
        this.userRepository = userRepository;
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
        // Auto-fill pilot from current user's linked crew member
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + currentUserEmail));

        if (currentUser.getCrewMemberId() == null) {
            throw new IllegalStateException(
                    "User " + currentUserEmail + " has no linked crew member. Cannot create flight order.");
        }
        order.setPilotId(currentUser.getCrewMemberId());

        // Validate operations are CONFIRMED
        validateOperations(order.getOperationIds());

        // Auto-calculate fields
        order.setCrewWeightKg(calculateCrewWeight(order.getPilotId(), order.getCrewMemberIds()));
        order.setEstimatedRouteLengthKm(calculateRouteLength(order.getOperationIds()));

        order.setStatus(OrderStatus.SUBMITTED);
        order.prePersist();
        return orderRepository.save(order);
    }

    public FlightOrder update(String id, FlightOrder updates, String currentUserEmail) {
        FlightOrder existing = findById(id);

        existing.setPlannedDeparture(updates.getPlannedDeparture());
        existing.setPlannedArrival(updates.getPlannedArrival());
        existing.setHelicopterId(updates.getHelicopterId());
        existing.setCrewMemberIds(updates.getCrewMemberIds());
        existing.setDepartureSiteId(updates.getDepartureSiteId());
        existing.setArrivalSiteId(updates.getArrivalSiteId());
        existing.setOperationIds(updates.getOperationIds());
        existing.setActualDeparture(updates.getActualDeparture());
        existing.setActualArrival(updates.getActualArrival());

        // Validate operations
        validateOperations(existing.getOperationIds());

        // Recalculate auto fields
        existing.setCrewWeightKg(calculateCrewWeight(existing.getPilotId(), existing.getCrewMemberIds()));
        existing.setEstimatedRouteLengthKm(calculateRouteLength(existing.getOperationIds()));

        existing.prePersist();
        return orderRepository.save(existing);
    }

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

        // Pilot weight
        CrewMember pilot = crewMemberRepository.findById(pilotId)
                .orElseThrow(() -> new NoSuchElementException("Pilot crew member not found: " + pilotId));
        total += pilot.getWeightKg();

        // Crew members weight
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
}
