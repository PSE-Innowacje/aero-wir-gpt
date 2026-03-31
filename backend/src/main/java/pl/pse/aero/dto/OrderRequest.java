package pl.pse.aero.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotNull
    private LocalDateTime plannedDeparture;

    @NotNull
    private LocalDateTime plannedArrival;

    @NotBlank
    private String helicopterId;

    private List<String> crewMemberIds;

    @NotBlank
    private String departureSiteId;

    @NotBlank
    private String arrivalSiteId;

    private List<String> operationIds;

    private LocalDateTime actualDeparture;

    private LocalDateTime actualArrival;
}
