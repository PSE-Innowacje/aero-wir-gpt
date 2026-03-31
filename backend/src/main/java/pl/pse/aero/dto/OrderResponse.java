package pl.pse.aero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.pse.aero.domain.FlightOrder;
import pl.pse.aero.domain.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private String id;
    private LocalDateTime plannedDeparture;
    private LocalDateTime plannedArrival;
    private String pilotId;
    private OrderStatus status;
    private String statusLabel;
    private String helicopterId;
    private List<String> crewMemberIds;
    private int crewWeightKg;
    private String departureSiteId;
    private String arrivalSiteId;
    private List<String> operationIds;
    private int estimatedRouteLengthKm;
    private LocalDateTime actualDeparture;
    private LocalDateTime actualArrival;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderResponse from(FlightOrder o) {
        return OrderResponse.builder()
                .id(o.getId())
                .plannedDeparture(o.getPlannedDeparture())
                .plannedArrival(o.getPlannedArrival())
                .pilotId(o.getPilotId())
                .status(o.getStatus())
                .statusLabel(o.getStatus().getLabel())
                .helicopterId(o.getHelicopterId())
                .crewMemberIds(o.getCrewMemberIds())
                .crewWeightKg(o.getCrewWeightKg())
                .departureSiteId(o.getDepartureSiteId())
                .arrivalSiteId(o.getArrivalSiteId())
                .operationIds(o.getOperationIds())
                .estimatedRouteLengthKm(o.getEstimatedRouteLengthKm())
                .actualDeparture(o.getActualDeparture())
                .actualArrival(o.getActualArrival())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
