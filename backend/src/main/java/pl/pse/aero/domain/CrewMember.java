package pl.pse.aero.domain;

import jakarta.validation.constraints.*;
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
public class CrewMember {

    @Id
    @GeneratedValue(strategy = GenerationStrategy.UNIQUE)
    private String id;

    @Field
    @NotBlank
    @Size(max = 100)
    private String firstName;

    @Field
    @NotBlank
    @Size(max = 100)
    private String lastName;

    @Field
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @Field
    @NotNull
    @Min(30)
    @Max(200)
    private Integer weightKg;

    @Field
    @NotNull
    private CrewRole role;

    @Field
    @Size(max = 30)
    private String pilotLicenseNumber;

    @Field
    private LocalDate licenseExpiryDate;

    @Field
    @NotNull
    private LocalDate trainingExpiryDate;
}
