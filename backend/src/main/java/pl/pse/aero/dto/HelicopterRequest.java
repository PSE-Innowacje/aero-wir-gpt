package pl.pse.aero.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.pse.aero.domain.HelicopterStatus;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelicopterRequest {

    @NotBlank
    @Size(max = 30)
    private String registrationNumber;

    @NotBlank
    @Size(max = 100)
    private String type;

    @Size(max = 100)
    private String description;

    @NotNull
    @Min(1)
    @Max(10)
    private Integer maxCrewCount;

    @NotNull
    @Min(1)
    @Max(1000)
    private Integer maxCrewWeightKg;

    @NotNull
    private HelicopterStatus status;

    private LocalDate inspectionExpiryDate;

    @NotNull
    @Min(1)
    @Max(1000)
    private Integer rangeKm;
}
