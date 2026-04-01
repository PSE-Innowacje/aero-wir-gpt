package pl.pse.aero.domain;

import jakarta.validation.constraints.*;
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
@Document(collection = "crew_member")
public class CrewMember {

    @Id
    private String id;

    @NotBlank
    @Size(max = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    private String lastName;

    @Indexed(unique = true)
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @NotNull
    @Min(30)
    @Max(200)
    private Integer weightKg;

    @NotNull
    private CrewRole role;

    @Size(max = 30)
    private String pilotLicenseNumber;

    private LocalDate licenseExpiryDate;

    @NotNull
    private LocalDate trainingExpiryDate;
}
