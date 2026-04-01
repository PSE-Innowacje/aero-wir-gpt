package pl.pse.aero.domain;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "helicopter")
public class Helicopter {

    @Id
    private String id;

    @Indexed(unique = true)
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
