package pl.pse.aero.domain

import spock.lang.Specification

class ActivityTypeSpec extends Specification {

    def "should define exactly 5 activity types"() {
        expect:
        ActivityType.values().length == 5
    }

    def "getLabel should return Polish text for #type"() {
        expect:
        type.label == expectedLabel

        where:
        type                              || expectedLabel
        ActivityType.VISUAL_INSPECTION    || "Oględziny wizualne"
        ActivityType.SCAN_3D              || "Skan 3D"
        ActivityType.FAULT_LOCATION       || "Lokalizacja awarii"
        ActivityType.PHOTOS               || "Zdjęcia"
        ActivityType.PATROL               || "Patrolowanie"
    }
}
