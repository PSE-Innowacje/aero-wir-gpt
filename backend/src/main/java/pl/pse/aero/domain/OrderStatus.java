package pl.pse.aero.domain;

public enum OrderStatus {
    SUBMITTED("Wprowadzone"),
    SENT_FOR_APPROVAL("Przekazane do akceptacji"),
    REJECTED("Odrzucone"),
    APPROVED("Zaakceptowane"),
    PARTIALLY_COMPLETED("Zrealizowane w części"),
    COMPLETED("Zrealizowane w całości"),
    NOT_COMPLETED("Nie zrealizowane");

    private final String label;

    OrderStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
