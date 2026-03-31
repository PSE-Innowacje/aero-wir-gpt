package pl.pse.aero.service

import org.springframework.mock.web.MockMultipartFile
import org.springframework.security.access.AccessDeniedException
import pl.pse.aero.domain.*
import pl.pse.aero.dto.KmlProcessingResult
import pl.pse.aero.repository.FlightOperationRepository
import spock.lang.Specification

import java.time.LocalDate

class OperationServiceSpec extends Specification {

    FlightOperationRepository repository = Mock()
    KmlService kmlService = Mock()
    OperationService service = new OperationService(repository, kmlService)

    def "findAll with status filter should return filtered and sorted operations"() {
        given:
        def op1 = FlightOperation.builder().id("o1").plannedDateEarliest(LocalDate.of(2026, 6, 1)).status(OperationStatus.CONFIRMED).build()
        def op2 = FlightOperation.builder().id("o2").plannedDateEarliest(LocalDate.of(2026, 5, 1)).status(OperationStatus.CONFIRMED).build()
        repository.findByStatus(OperationStatus.CONFIRMED) >> [op1, op2]

        when:
        def result = service.findAll(OperationStatus.CONFIRMED)

        then:
        result*.id == ["o2", "o1"]  // sorted by plannedDateEarliest ASC
    }

    def "findAll with null filter should return all operations"() {
        given:
        repository.findAll() >> new ArrayList([
                FlightOperation.builder().id("o1").plannedDateEarliest(null).build()
        ])

        when:
        def result = service.findAll((OperationStatus) null)

        then:
        result.size() == 1
    }

    def "create should set status SUBMITTED, call KmlService, and persist"() {
        given:
        def op = FlightOperation.builder()
                .orderNumber("DE-25-001")
                .shortDescription("Test op")
                .build()
        def kmlFile = new MockMultipartFile("file", "route.kml", "application/xml", "data".bytes)
        def kmlResult = new KmlProcessingResult("/path/route.kml", [[52.0d, 20.0d] as double[]], 100)
        kmlService.saveAndParse(kmlFile) >> kmlResult
        repository.save(_) >> { FlightOperation o -> o }

        when:
        def result = service.create(op, kmlFile, "planista@aero.pl")

        then:
        result.status == OperationStatus.SUBMITTED
        result.createdByEmail == "planista@aero.pl"
        result.kmlFilePath == "/path/route.kml"
        result.routeLengthKm == 100
        result.kmlPoints.size() == 1
        result.createdAt != null
    }

    def "create without KML file should still work"() {
        given:
        def op = FlightOperation.builder()
                .orderNumber("CJI-001")
                .shortDescription("No KML")
                .build()
        repository.save(_) >> { FlightOperation o -> o }

        when:
        def result = service.create(op, null, "planista@aero.pl")

        then:
        result.status == OperationStatus.SUBMITTED
        result.kmlFilePath == null
        0 * kmlService.saveAndParse(_)
    }

    def "update as PLANNER should apply allowed fields only"() {
        given:
        def existing = FlightOperation.builder()
                .id("o1")
                .orderNumber("OLD")
                .shortDescription("Old desc")
                .status(OperationStatus.SUBMITTED)
                .plannedDateEarliest(LocalDate.of(2026, 1, 1))
                .build()
        repository.findById("o1") >> Optional.of(existing)
        repository.save(_) >> { FlightOperation o -> o }

        def updates = FlightOperation.builder()
                .orderNumber("NEW")
                .shortDescription("New desc")
                .plannedDateEarliest(LocalDate.of(2099, 1, 1))  // planner shouldn't change this
                .build()

        when:
        def result = service.update("o1", updates, UserRole.PLANNER)

        then:
        result.orderNumber == "NEW"
        result.shortDescription == "New desc"
        result.plannedDateEarliest == LocalDate.of(2026, 1, 1)  // unchanged
    }

    def "update as SUPERVISOR should apply all fields including planned dates"() {
        given:
        def existing = FlightOperation.builder()
                .id("o1")
                .orderNumber("OLD")
                .status(OperationStatus.SUBMITTED)
                .build()
        repository.findById("o1") >> Optional.of(existing)
        repository.save(_) >> { FlightOperation o -> o }

        def updates = FlightOperation.builder()
                .orderNumber("NEW")
                .shortDescription("Sup edit")
                .plannedDateEarliest(LocalDate.of(2026, 7, 1))
                .plannedDateLatest(LocalDate.of(2026, 8, 1))
                .postCompletionNotes("Notes")
                .build()

        when:
        def result = service.update("o1", updates, UserRole.SUPERVISOR)

        then:
        result.plannedDateEarliest == LocalDate.of(2026, 7, 1)
        result.plannedDateLatest == LocalDate.of(2026, 8, 1)
        result.postCompletionNotes == "Notes"
    }

    def "update as PLANNER in COMPLETED status should throw"() {
        given:
        def existing = FlightOperation.builder()
                .id("o1")
                .status(OperationStatus.COMPLETED)
                .build()
        repository.findById("o1") >> Optional.of(existing)

        when:
        service.update("o1", FlightOperation.builder().build(), UserRole.PLANNER)

        then:
        thrown(IllegalStateException)
    }

    def "update as ADMIN should throw AccessDeniedException"() {
        given:
        def existing = FlightOperation.builder().id("o1").status(OperationStatus.SUBMITTED).build()
        repository.findById("o1") >> Optional.of(existing)

        when:
        service.update("o1", FlightOperation.builder().build(), UserRole.ADMIN)

        then:
        thrown(AccessDeniedException)
    }

    def "addComment should append to operation's comments list"() {
        given:
        def op = FlightOperation.builder().id("o1").build()
        repository.findById("o1") >> Optional.of(op)
        repository.save(_) >> { FlightOperation o -> o }

        when:
        service.addComment("o1", "Test comment", "planista@aero.pl")

        then:
        1 * repository.save({ FlightOperation o ->
            o.comments.size() == 1 &&
            o.comments[0].content == "Test comment" &&
            o.comments[0].authorEmail == "planista@aero.pl"
        })
    }
}
