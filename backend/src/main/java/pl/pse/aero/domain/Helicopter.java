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
import org.springframework.data.couchbase.core.mapping.Document;
import org.springframework.data.couchbase.core.mapping.Field;
import org.springframework.data.couchbase.core.mapping.id.GeneratedValue;
import org.springframework.data.couchbase.core.mapping.id.GenerationStrategy;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document
public class Helicopter {

    @Id
    @GeneratedValue(strategy = GenerationStrategy.UNIQUE)
    private String id;

    @Field
    @NotBlank
    @Size(max = 30)
    private String registrationNumber;

    @Field
    @NotBlank
    @Size(max = 100)
    private String type;

    @Field
    @Size(max = 100)
    private String description;

    @Field
    @NotNull
    @Min(1)
    @Max(10)
    private Integer maxCrewCount;

    @Field
    @NotNull
    @Min(1)
    @Max(1000)
    private Integer maxCrewWeightKg;

    @Field
    @NotNull
    private HelicopterStatus status;

    @Field
    private LocalDate inspectionExpiryDate;

    @Field
    @NotNull
    @Min(1)
    @Max(1000)
    private Integer rangeKm;
}
