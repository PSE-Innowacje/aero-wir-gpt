package pl.pse.aero.domain;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "flight_order")
public class FlightOrder {

    @Id
    private String id;

    @NotNull
    private LocalDateTime plannedDeparture;

    @NotNull
    private LocalDateTime plannedArrival;

    @NotNull
    private String pilotId;

    @Indexed
    @NotNull
    @Builder.Default
    private OrderStatus status = OrderStatus.SUBMITTED;

    @NotNull
    private String helicopterId;

    @Builder.Default
    private List<String> crewMemberIds = new ArrayList<>();

    private int crewWeightKg;

    @NotNull
    private String departureSiteId;

    @NotNull
    private String arrivalSiteId;

    @Builder.Default
    private List<String> operationIds = new ArrayList<>();

    private int estimatedRouteLengthKm;

    private LocalDateTime actualDeparture;

    private LocalDateTime actualArrival;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }
}
