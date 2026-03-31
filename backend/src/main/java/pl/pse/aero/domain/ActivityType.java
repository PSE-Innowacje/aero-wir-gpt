package pl.pse.aero.domain;

public enum ActivityType {
    VISUAL_INSPECTION("Oględziny wizualne"),
    SCAN_3D("Skan 3D"),
    FAULT_LOCATION("Lokalizacja awarii"),
    PHOTOS("Zdjęcia"),
    PATROL("Patrolowanie");

    private final String label;

    ActivityType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
