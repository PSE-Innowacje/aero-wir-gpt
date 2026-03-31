package pl.pse.aero.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.pse.aero.domain.FlightOrder;
import pl.pse.aero.domain.OrderStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderListResponse {

    private String id;
    private LocalDateTime plannedDeparture;
    private String helicopterId;
    private String pilotId;
    private OrderStatus status;
    private String statusLabel;

    public static OrderListResponse from(FlightOrder o) {
        return OrderListResponse.builder()
                .id(o.getId())
                .plannedDeparture(o.getPlannedDeparture())
                .helicopterId(o.getHelicopterId())
                .pilotId(o.getPilotId())
                .status(o.getStatus())
                .statusLabel(o.getStatus().getLabel())
                .build();
    }
}
