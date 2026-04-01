package pl.pse.aero.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "flight_operation")
public class FlightOperation {

    @Id
    private String id;

    @NotBlank
    @Size(max = 30)
    private String orderNumber;

    @NotBlank
    @Size(max = 100)
    private String shortDescription;

    private byte[] kmlFileContent;

    private String kmlFileName;

    private List<double[]> kmlPoints;

    private LocalDate proposedDateEarliest;

    private LocalDate proposedDateLatest;

    @Size(max = 500)
    private String additionalInfo;

    private int routeLengthKm;

    private LocalDate plannedDateEarliest;

    private LocalDate plannedDateLatest;

    @Indexed
    @NotNull
    @Builder.Default
    private OperationStatus status = OperationStatus.SUBMITTED;

    @Size(max = 100)
    private String createdByEmail;

    @Size(max = 500)
    private String postCompletionNotes;

    @Builder.Default
    private List<ActivityType> activityTypes = new ArrayList<>();

    @Builder.Default
    private List<String> contacts = new ArrayList<>();

    @Builder.Default
    private List<OperationComment> comments = new ArrayList<>();

    @Builder.Default
    private List<OperationChangeHistory> changeHistory = new ArrayList<>();

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }
}
