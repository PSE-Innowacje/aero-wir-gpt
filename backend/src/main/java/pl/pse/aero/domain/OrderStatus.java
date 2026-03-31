package pl.pse.aero.domain;

import java.util.Arrays;

public enum OrderStatus {
    SUBMITTED(1, "Wprowadzone"),
    SENT_FOR_APPROVAL(2, "Przekazane do akceptacji"),
    REJECTED(3, "Odrzucone"),
    APPROVED(4, "Zaakceptowane"),
    PARTIALLY_COMPLETED(5, "Zrealizowane w części"),
    COMPLETED(6, "Zrealizowane w całości"),
    NOT_COMPLETED(7, "Nie zrealizowane");

    private final int code;
    private final String label;

    OrderStatus(int code, String label) {
        this.code = code;
        this.label = label;
    }

    public int getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public static OrderStatus fromCode(int code) {
        return Arrays.stream(values())
                .filter(s -> s.code == code)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown OrderStatus code: " + code));
    }
}
