package pl.pse.aero.domain;

import java.util.Arrays;

public enum OperationStatus {
    SUBMITTED(1, "Wprowadzone"),
    REJECTED(2, "Odrzucone"),
    CONFIRMED(3, "Potwierdzone do planu"),
    SCHEDULED(4, "Zaplanowane do zlecenia"),
    PARTIALLY_COMPLETED(5, "Częściowo zrealizowane"),
    COMPLETED(6, "Zrealizowane"),
    CANCELLED(7, "Rezygnacja");

    private final int code;
    private final String label;

    OperationStatus(int code, String label) {
        this.code = code;
        this.label = label;
    }

    public int getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public static OperationStatus fromCode(int code) {
        return Arrays.stream(values())
                .filter(s -> s.code == code)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown OperationStatus code: " + code));
    }
}
