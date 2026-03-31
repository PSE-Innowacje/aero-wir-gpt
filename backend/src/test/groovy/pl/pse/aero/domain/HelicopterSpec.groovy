package pl.pse.aero.domain

import spock.lang.Specification

import java.time.LocalDate

class HelicopterSpec extends Specification {

    def "should create helicopter with all fields via builder"() {
        when:
        def heli = Helicopter.builder()
                .id("h1")
                .registrationNumber("SP-ABC")
                .type("EC135")
                .description("Main ops helicopter")
                .maxCrewCount(4)
                .maxCrewWeightKg(400)
                .status(HelicopterStatus.ACTIVE)
                .inspectionExpiryDate(LocalDate.of(2026, 12, 31))
                .rangeKm(600)
                .build()

        then:
        heli.registrationNumber == "SP-ABC"
        heli.type == "EC135"
        heli.description == "Main ops helicopter"
        heli.maxCrewCount == 4
        heli.maxCrewWeightKg == 400
        heli.status == HelicopterStatus.ACTIVE
        heli.inspectionExpiryDate == LocalDate.of(2026, 12, 31)
        heli.rangeKm == 600
    }

    def "should allow null description and inspectionExpiryDate"() {
        when:
        def heli = Helicopter.builder()
                .registrationNumber("SP-XYZ")
                .type("Bell 407")
                .maxCrewCount(2)
                .maxCrewWeightKg(200)
                .status(HelicopterStatus.INACTIVE)
                .rangeKm(300)
                .build()

        then:
        heli.description == null
        heli.inspectionExpiryDate == null
    }

    def "HelicopterStatus should define exactly 2 values"() {
        expect:
        HelicopterStatus.values().length == 2
        HelicopterStatus.values() as Set == [HelicopterStatus.ACTIVE, HelicopterStatus.INACTIVE] as Set
    }
}
