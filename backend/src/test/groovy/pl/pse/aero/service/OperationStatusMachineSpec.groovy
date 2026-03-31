package pl.pse.aero.service

import org.springframework.security.access.AccessDeniedException
import pl.pse.aero.domain.FlightOperation
import pl.pse.aero.domain.OperationStatus
import pl.pse.aero.domain.UserRole
import pl.pse.aero.repository.FlightOperationRepository
import spock.lang.Specification

import java.time.LocalDate

class OperationStatusMachineSpec extends Specification {

    FlightOperationRepository repository = Mock()
    KmlService kmlService = Mock()
    OperationService service = new OperationService(repository, kmlService)

    def makeOp(String id, OperationStatus status, LocalDate plannedEarliest = null, LocalDate plannedLatest = null) {
        def op = FlightOperation.builder()
                .id(id)
                .orderNumber("X")
                .shortDescription("Y")
                .status(status)
                .plannedDateEarliest(plannedEarliest)
                .plannedDateLatest(plannedLatest)
                .build()
        repository.findById(id) >> Optional.of(op)
        repository.save(_) >> { FlightOperation o -> o }
        return op
    }

    // --- reject ---

    def "reject: SUBMITTED -> REJECTED by SUPERVISOR"() {
        given:
        makeOp("o1", OperationStatus.SUBMITTED)

        when:
        def result = service.changeStatus("o1", "reject", UserRole.SUPERVISOR)

        then:
        result.status == OperationStatus.REJECTED
    }

    def "reject: should fail for PLANNER"() {
        given:
        makeOp("o1", OperationStatus.SUBMITTED)

        when:
        service.changeStatus("o1", "reject", UserRole.PLANNER)

        then:
        thrown(AccessDeniedException)
    }

    def "reject: should fail if not SUBMITTED"() {
        given:
        makeOp("o1", OperationStatus.CONFIRMED)

        when:
        service.changeStatus("o1", "reject", UserRole.SUPERVISOR)

        then:
        thrown(IllegalStateException)
    }

    // --- confirm ---

    def "confirm: SUBMITTED -> CONFIRMED by SUPERVISOR with planned dates"() {
        given:
        makeOp("o1", OperationStatus.SUBMITTED, LocalDate.of(2026, 7, 1), LocalDate.of(2026, 8, 1))

        when:
        def result = service.changeStatus("o1", "confirm", UserRole.SUPERVISOR)

        then:
        result.status == OperationStatus.CONFIRMED
    }

    def "confirm: should fail without planned dates"() {
        given:
        makeOp("o1", OperationStatus.SUBMITTED)

        when:
        service.changeStatus("o1", "confirm", UserRole.SUPERVISOR)

        then:
        thrown(IllegalArgumentException)
    }

    def "confirm: should fail for PLANNER"() {
        given:
        makeOp("o1", OperationStatus.SUBMITTED, LocalDate.of(2026, 7, 1), LocalDate.of(2026, 8, 1))

        when:
        service.changeStatus("o1", "confirm", UserRole.PLANNER)

        then:
        thrown(AccessDeniedException)
    }

    // --- cancel ---

    def "cancel: #fromStatus -> CANCELLED by PLANNER"() {
        given:
        makeOp("o1", fromStatus)

        when:
        def result = service.changeStatus("o1", "cancel", UserRole.PLANNER)

        then:
        result.status == OperationStatus.CANCELLED

        where:
        fromStatus << [OperationStatus.SUBMITTED, OperationStatus.CONFIRMED, OperationStatus.SCHEDULED]
    }

    def "cancel: should fail for SUPERVISOR"() {
        given:
        makeOp("o1", OperationStatus.SUBMITTED)

        when:
        service.changeStatus("o1", "cancel", UserRole.SUPERVISOR)

        then:
        thrown(AccessDeniedException)
    }

    def "cancel: should fail from COMPLETED"() {
        given:
        makeOp("o1", OperationStatus.COMPLETED)

        when:
        service.changeStatus("o1", "cancel", UserRole.PLANNER)

        then:
        thrown(IllegalStateException)
    }

    // --- internal transitions ---

    def "schedule: CONFIRMED -> SCHEDULED"() {
        given:
        makeOp("o1", OperationStatus.CONFIRMED)

        when:
        def result = service.changeStatus("o1", "schedule", null)

        then:
        result.status == OperationStatus.SCHEDULED
    }

    def "complete: SCHEDULED -> COMPLETED"() {
        given:
        makeOp("o1", OperationStatus.SCHEDULED)

        when:
        def result = service.changeStatus("o1", "complete", null)

        then:
        result.status == OperationStatus.COMPLETED
    }

    def "partialComplete: SCHEDULED -> PARTIALLY_COMPLETED"() {
        given:
        makeOp("o1", OperationStatus.SCHEDULED)

        when:
        def result = service.changeStatus("o1", "partialComplete", null)

        then:
        result.status == OperationStatus.PARTIALLY_COMPLETED
    }

    def "unschedule: SCHEDULED -> CONFIRMED"() {
        given:
        makeOp("o1", OperationStatus.SCHEDULED)

        when:
        def result = service.changeStatus("o1", "unschedule", null)

        then:
        result.status == OperationStatus.CONFIRMED
    }

    // --- unknown action ---

    def "unknown action should throw"() {
        given:
        makeOp("o1", OperationStatus.SUBMITTED)

        when:
        service.changeStatus("o1", "bogus", UserRole.SUPERVISOR)

        then:
        thrown(IllegalArgumentException)
    }
}
