package pl.pse.aero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.pse.aero.domain.LandingSite;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandingSiteResponse {

    private String id;
    private String name;
    private Double latitude;
    private Double longitude;

    public static LandingSiteResponse from(LandingSite ls) {
        return LandingSiteResponse.builder()
                .id(ls.getId())
                .name(ls.getName())
                .latitude(ls.getLatitude())
                .longitude(ls.getLongitude())
                .build();
    }
}
