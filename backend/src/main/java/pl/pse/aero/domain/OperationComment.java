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
public class OperationComment {

    private String content;
    private String authorEmail;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
