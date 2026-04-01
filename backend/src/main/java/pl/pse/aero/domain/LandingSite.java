package pl.pse.aero.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "landing_site")
public class LandingSite {

    @Id
    private String id;

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;
}
