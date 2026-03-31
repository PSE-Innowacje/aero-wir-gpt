package pl.pse.aero.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.pse.aero.domain.ActivityType;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationRequest {

    @NotBlank
    @Size(max = 30)
    private String orderNumber;

    @NotBlank
    @Size(max = 100)
    private String shortDescription;

    @NotEmpty
    private List<ActivityType> activityTypes;

    private LocalDate proposedDateEarliest;
    private LocalDate proposedDateLatest;

    @Size(max = 500)
    private String additionalInfo;

    private LocalDate plannedDateEarliest;
    private LocalDate plannedDateLatest;

    private List<String> contacts;

    @Size(max = 500)
    private String postCompletionNotes;

    private String kmlFilePath;
    private List<double[]> kmlPoints;
    private Integer routeLengthKm;
}
