package pl.pse.aero.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.couchbase.core.mapping.Document;
import org.springframework.data.couchbase.core.mapping.Field;
import org.springframework.data.couchbase.core.mapping.id.GeneratedValue;
import org.springframework.data.couchbase.core.mapping.id.GenerationStrategy;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document
public class FlightOperation {

    @Id
    @GeneratedValue(strategy = GenerationStrategy.UNIQUE)
    private String id;

    @Field
    @NotBlank
    @Size(max = 30)
    private String orderNumber;

    @Field
    @NotBlank
    @Size(max = 100)
    private String shortDescription;

    @Field
    @Size(max = 500)
    private String kmlFilePath;

    @Field
    private List<double[]> kmlPoints;

    @Field
    private LocalDate proposedDateEarliest;

    @Field
    private LocalDate proposedDateLatest;

    @Field
    @Size(max = 500)
    private String additionalInfo;

    @Field
    private int routeLengthKm;

    @Field
    private LocalDate plannedDateEarliest;

    @Field
    private LocalDate plannedDateLatest;

    @Field
    @NotNull
    @Builder.Default
    private OperationStatus status = OperationStatus.SUBMITTED;

    @Field
    @Size(max = 100)
    private String createdByEmail;

    @Field
    @Size(max = 500)
    private String postCompletionNotes;

    @Field
    @Builder.Default
    private List<ActivityType> activityTypes = new ArrayList<>();

    @Field
    @Builder.Default
    private List<String> contacts = new ArrayList<>();

    @Field
    private LocalDateTime createdAt;

    @Field
    private LocalDateTime updatedAt;

    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }
}
