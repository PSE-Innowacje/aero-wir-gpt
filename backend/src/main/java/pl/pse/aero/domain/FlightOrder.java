package pl.pse.aero.domain;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.couchbase.core.mapping.Document;
import org.springframework.data.couchbase.core.mapping.Field;
import org.springframework.data.couchbase.core.mapping.id.GeneratedValue;
import org.springframework.data.couchbase.core.mapping.id.GenerationStrategy;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document
public class FlightOrder {

    @Id
    @GeneratedValue(strategy = GenerationStrategy.UNIQUE)
    private String id;

    @Field
    @NotNull
    private LocalDateTime plannedDeparture;

    @Field
    @NotNull
    private LocalDateTime plannedArrival;

    @Field
    @NotNull
    private String pilotId;

    @Field
    @NotNull
    @Builder.Default
    private OrderStatus status = OrderStatus.SUBMITTED;

    @Field
    @NotNull
    private String helicopterId;

    @Field
    @Builder.Default
    private List<String> crewMemberIds = new ArrayList<>();

    @Field
    private int crewWeightKg;

    @Field
    @NotNull
    private String departureSiteId;

    @Field
    @NotNull
    private String arrivalSiteId;

    @Field
    @Builder.Default
    private List<String> operationIds = new ArrayList<>();

    @Field
    private int estimatedRouteLengthKm;

    @Field
    private LocalDateTime actualDeparture;

    @Field
    private LocalDateTime actualArrival;

    @Field
    private LocalDateTime createdAt;

    @Field
    private LocalDateTime updatedAt;

    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }
}
