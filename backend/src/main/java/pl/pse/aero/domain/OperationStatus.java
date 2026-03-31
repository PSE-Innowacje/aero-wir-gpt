package pl.pse.aero.domain;

public enum OperationStatus {
    SUBMITTED("Wprowadzone"),
    REJECTED("Odrzucone"),
    CONFIRMED("Potwierdzone do planu"),
    SCHEDULED("Zaplanowane do zlecenia"),
    PARTIALLY_COMPLETED("Częściowo zrealizowane"),
    COMPLETED("Zrealizowane"),
    CANCELLED("Rezygnacja");

    private final String label;

    OperationStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
