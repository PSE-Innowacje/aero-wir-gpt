package pl.pse.aero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.pse.aero.domain.ActivityType;
import pl.pse.aero.domain.FlightOperation;
import pl.pse.aero.domain.OperationStatus;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationListResponse {

    private String id;
    private String orderNumber;
    private List<ActivityType> activityTypes;
    private LocalDate proposedDateEarliest;
    private LocalDate proposedDateLatest;
    private LocalDate plannedDateEarliest;
    private LocalDate plannedDateLatest;
    private OperationStatus status;
    private String statusLabel;
    private int routeLengthKm;

    public static OperationListResponse from(FlightOperation op) {
        return OperationListResponse.builder()
                .id(op.getId())
                .orderNumber(op.getOrderNumber())
                .activityTypes(op.getActivityTypes())
                .proposedDateEarliest(op.getProposedDateEarliest())
                .proposedDateLatest(op.getProposedDateLatest())
                .plannedDateEarliest(op.getPlannedDateEarliest())
                .plannedDateLatest(op.getPlannedDateLatest())
                .status(op.getStatus())
                .statusLabel(op.getStatus().getLabel())
                .routeLengthKm(op.getRouteLengthKm())
                .build();
    }
}
