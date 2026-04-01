package pl.pse.aero.domain

import spock.lang.Specification

import java.time.LocalDate
import java.time.LocalDateTime

class FlightOperationSpec extends Specification {

    def "should create flight operation with all fields via builder"() {
        when:
        def op = FlightOperation.builder()
                .id("op1")
                .orderNumber("DE-25-12020")
                .shortDescription("Inspekcja linii 400kV")
                .kmlFileContent("kml data".bytes)
                .kmlFileName("route.kml")
                .kmlPoints([[52.0d, 20.0d] as double[], [52.1d, 20.1d] as double[]])
                .proposedDateEarliest(LocalDate.of(2026, 5, 1))
                .proposedDateLatest(LocalDate.of(2026, 9, 30))
                .additionalInfo("Priorytet wysoki")
                .routeLengthKm(85)
                .status(OperationStatus.SUBMITTED)
                .createdByEmail("planista@aero.pl")
                .activityTypes([ActivityType.VISUAL_INSPECTION, ActivityType.PHOTOS])
                .contacts(["jan@pse.pl", "anna@pse.pl"])
                .build()

        then:
        op.orderNumber == "DE-25-12020"
        op.shortDescription == "Inspekcja linii 400kV"
        op.kmlPoints.size() == 2
        op.routeLengthKm == 85
        op.status == OperationStatus.SUBMITTED
        op.activityTypes.size() == 2
        op.contacts.size() == 2
    }

    def "should default status to SUBMITTED"() {
        when:
        def op = FlightOperation.builder()
                .orderNumber("CJI-3203")
                .shortDescription("Test")
                .build()

        then:
        op.status == OperationStatus.SUBMITTED
    }

    def "should default activityTypes and contacts to empty lists"() {
        when:
        def op = FlightOperation.builder()
                .orderNumber("X")
                .shortDescription("Y")
                .build()

        then:
        op.activityTypes != null
        op.activityTypes.isEmpty()
        op.contacts != null
        op.contacts.isEmpty()
    }

    def "prePersist should set createdAt and updatedAt"() {
        given:
        def op = FlightOperation.builder()
                .orderNumber("X")
                .shortDescription("Y")
                .build()
        def before = LocalDateTime.now()

        when:
        op.prePersist()

        then:
        op.createdAt != null
        op.updatedAt != null
        !op.createdAt.isBefore(before)
    }

    def "prePersist should not overwrite existing createdAt"() {
        given:
        def fixed = LocalDateTime.of(2026, 1, 1, 12, 0)
        def op = FlightOperation.builder()
                .orderNumber("X")
                .shortDescription("Y")
                .createdAt(fixed)
                .build()

        when:
        op.prePersist()

        then:
        op.createdAt == fixed
        op.updatedAt != null
        op.updatedAt != fixed
    }

    def "should allow null optional fields"() {
        when:
        def op = FlightOperation.builder()
                .orderNumber("X")
                .shortDescription("Y")
                .build()

        then:
        op.proposedDateEarliest == null
        op.proposedDateLatest == null
        op.plannedDateEarliest == null
        op.plannedDateLatest == null
        op.additionalInfo == null
        op.postCompletionNotes == null
        op.kmlFileContent == null
        op.kmlFileName == null
        op.kmlPoints == null
    }
}
