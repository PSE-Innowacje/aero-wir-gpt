package pl.pse.aero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.pse.aero.domain.CrewMember;
import pl.pse.aero.domain.CrewRole;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrewMemberResponse {

    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private Integer weightKg;
    private CrewRole role;
    private String pilotLicenseNumber;
    private LocalDate licenseExpiryDate;
    private LocalDate trainingExpiryDate;

    public static CrewMemberResponse from(CrewMember m) {
        return CrewMemberResponse.builder()
                .id(m.getId())
                .firstName(m.getFirstName())
                .lastName(m.getLastName())
                .email(m.getEmail())
                .weightKg(m.getWeightKg())
                .role(m.getRole())
                .pilotLicenseNumber(m.getPilotLicenseNumber())
                .licenseExpiryDate(m.getLicenseExpiryDate())
                .trainingExpiryDate(m.getTrainingExpiryDate())
                .build();
    }
}
