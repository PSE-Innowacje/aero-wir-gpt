package pl.pse.aero.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationChangeHistory {

    private String fieldName;
    private String oldValue;
    private String newValue;
    private String changedByEmail;
    @Builder.Default
    private LocalDateTime changedAt = LocalDateTime.now();
}
