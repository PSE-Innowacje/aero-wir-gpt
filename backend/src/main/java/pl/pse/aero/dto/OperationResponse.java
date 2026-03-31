package pl.pse.aero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.pse.aero.domain.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationResponse {

    private String id;
    private String orderNumber;
    private String shortDescription;
    private String kmlFilePath;
    private List<double[]> kmlPoints;
    private LocalDate proposedDateEarliest;
    private LocalDate proposedDateLatest;
    private String additionalInfo;
    private int routeLengthKm;
    private LocalDate plannedDateEarliest;
    private LocalDate plannedDateLatest;
    private OperationStatus status;
    private String statusLabel;
    private String createdByEmail;
    private String postCompletionNotes;
    private List<ActivityType> activityTypes;
    private List<String> contacts;
    private List<OperationComment> comments;
    private List<OperationChangeHistory> changeHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OperationResponse from(FlightOperation op) {
        return OperationResponse.builder()
                .id(op.getId())
                .orderNumber(op.getOrderNumber())
                .shortDescription(op.getShortDescription())
                .kmlFilePath(op.getKmlFilePath())
                .kmlPoints(op.getKmlPoints())
                .proposedDateEarliest(op.getProposedDateEarliest())
                .proposedDateLatest(op.getProposedDateLatest())
                .additionalInfo(op.getAdditionalInfo())
                .routeLengthKm(op.getRouteLengthKm())
                .plannedDateEarliest(op.getPlannedDateEarliest())
                .plannedDateLatest(op.getPlannedDateLatest())
                .status(op.getStatus())
                .statusLabel(op.getStatus().getLabel())
                .createdByEmail(op.getCreatedByEmail())
                .postCompletionNotes(op.getPostCompletionNotes())
                .activityTypes(op.getActivityTypes())
                .contacts(op.getContacts())
                .comments(op.getComments())
                .changeHistory(op.getChangeHistory())
                .createdAt(op.getCreatedAt())
                .updatedAt(op.getUpdatedAt())
                .build();
    }
}
