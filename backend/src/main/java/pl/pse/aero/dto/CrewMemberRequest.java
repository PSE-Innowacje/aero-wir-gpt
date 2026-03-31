package pl.pse.aero.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.pse.aero.domain.CrewRole;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrewMemberRequest {

    @NotBlank
    @Size(max = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    private String lastName;

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
