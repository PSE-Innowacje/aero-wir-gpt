package pl.pse.aero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.pse.aero.domain.Helicopter;
import pl.pse.aero.domain.HelicopterStatus;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelicopterResponse {

    private String id;
    private String registrationNumber;
    private String type;
    private String description;
    private Integer maxCrewCount;
    private Integer maxCrewWeightKg;
    private HelicopterStatus status;
    private LocalDate inspectionExpiryDate;
    private Integer rangeKm;

    public static HelicopterResponse from(Helicopter h) {
        return HelicopterResponse.builder()
                .id(h.getId())
                .registrationNumber(h.getRegistrationNumber())
                .type(h.getType())
                .description(h.getDescription())
                .maxCrewCount(h.getMaxCrewCount())
                .maxCrewWeightKg(h.getMaxCrewWeightKg())
                .status(h.getStatus())
                .inspectionExpiryDate(h.getInspectionExpiryDate())
                .rangeKm(h.getRangeKm())
                .build();
    }
}
