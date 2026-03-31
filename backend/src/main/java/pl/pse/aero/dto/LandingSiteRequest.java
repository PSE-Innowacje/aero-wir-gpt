package pl.pse.aero.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandingSiteRequest {

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;
}
