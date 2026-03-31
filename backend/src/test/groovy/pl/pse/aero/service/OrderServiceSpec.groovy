package pl.pse.aero.service

import org.springframework.security.access.AccessDeniedException
import pl.pse.aero.domain.*
import pl.pse.aero.repository.*
import spock.lang.Specification

import java.time.LocalDate
import java.time.LocalDateTime

class OrderServiceSpec extends Specification {

    FlightOrderRepository orderRepository = Mock()
    HelicopterRepository helicopterRepository = Mock()
    CrewMemberRepository crewMemberRepository = Mock()
    FlightOperationRepository operationRepository = Mock()
    UserRepository userRepository = Mock()
    OperationService operationService = Mock()

    OrderService service = new OrderService(
            orderRepository, helicopterRepository, crewMemberRepository,
            operationRepository, userRepository, operationService)

    def pilot = CrewMember.builder().id("pilot1").firstName("Jan").lastName("K").email("pilot@aero.pl")
            .weightKg(82).role(CrewRole.PILOT).licenseExpiryDate(LocalDate.of(2027, 12, 31))
            .trainingExpiryDate(LocalDate.of(2027, 12, 31)).build()
    def crew1 = CrewMember.builder().id("crew1").firstName("Anna").lastName("W").weightKg(65)
            .role(CrewRole.OBSERVER).trainingExpiryDate(LocalDate.of(2027, 12, 31)).build()
    def heli = Helicopter.builder().id("h1").registrationNumber("SP-HEA").status(HelicopterStatus.ACTIVE)
            .inspectionExpiryDate(LocalDate.of(2027, 12, 31)).maxCrewWeightKg(450).rangeKm(600).build()
    def confirmedOp = FlightOperation.builder().id("op1").status(OperationStatus.CONFIRMED).routeLengthKm(100).build()

    // --- CRUD tests ---

    def "create should auto-fill pilot and calculate fields"() {
        given:
        def user = User.builder().email("pilot@aero.pl").crewMemberId("pilot1").build()
        userRepository.findByEmail("pilot@aero.pl") >> Optional.of(user)
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)
        helicopterRepository.findById("h1") >> Optional.of(heli)
        operationRepository.findById("op1") >> Optional.of(confirmedOp)
        orderRepository.save(_) >> { FlightOrder o -> o }

        def order = FlightOrder.builder()
                .plannedDeparture(LocalDateTime.of(2026, 7, 1, 8, 0))
                .plannedArrival(LocalDateTime.of(2026, 7, 1, 12, 0))
                .helicopterId("h1").departureSiteId("s1").arrivalSiteId("s2")
                .operationIds(["op1"]).build()

        when:
        def result = service.create(order, "pilot@aero.pl")

        then:
        result.pilotId == "pilot1"
        result.crewWeightKg == 82
        result.estimatedRouteLengthKm == 100
    }

    // --- 54-SC-AERO: 5 validation rules ---

    def "rule 1: reject expired helicopter inspection"() {
        given:
        def expiredHeli = Helicopter.builder().id("h1").inspectionExpiryDate(LocalDate.of(2025, 1, 1))
                .maxCrewWeightKg(999).rangeKm(999).build()
        helicopterRepository.findById("h1") >> Optional.of(expiredHeli)
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)

        def order = FlightOrder.builder().pilotId("pilot1").helicopterId("h1")
                .plannedDeparture(LocalDateTime.of(2026, 7, 1, 8, 0))
                .crewWeightKg(82).estimatedRouteLengthKm(100).build()

        when:
        service.validateFlightRules(order)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("Przegląd helikoptera")
    }

    def "rule 2: reject expired pilot license"() {
        given:
        def expiredPilot = CrewMember.builder().id("pilot1").firstName("J").lastName("K").weightKg(82)
                .licenseExpiryDate(LocalDate.of(2025, 1, 1))
                .trainingExpiryDate(LocalDate.of(2027, 12, 31)).build()
        helicopterRepository.findById("h1") >> Optional.of(heli)
        crewMemberRepository.findById("pilot1") >> Optional.of(expiredPilot)

        def order = FlightOrder.builder().pilotId("pilot1").helicopterId("h1")
                .plannedDeparture(LocalDateTime.of(2026, 7, 1, 8, 0))
                .crewWeightKg(82).estimatedRouteLengthKm(100).build()

        when:
        service.validateFlightRules(order)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("Licencja pilota")
    }

    def "rule 3: reject expired crew training"() {
        given:
        def expiredCrew = CrewMember.builder().id("crew1").firstName("Anna").lastName("W").weightKg(65)
                .trainingExpiryDate(LocalDate.of(2025, 1, 1)).build()
        helicopterRepository.findById("h1") >> Optional.of(heli)
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)
        crewMemberRepository.findById("crew1") >> Optional.of(expiredCrew)

        def order = FlightOrder.builder().pilotId("pilot1").helicopterId("h1")
                .plannedDeparture(LocalDateTime.of(2026, 7, 1, 8, 0))
                .crewMemberIds(["crew1"]).crewWeightKg(147).estimatedRouteLengthKm(100).build()

        when:
        service.validateFlightRules(order)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("Szkolenie Anna W")
    }

    def "rule 4: reject overweight crew"() {
        given:
        def smallHeli = Helicopter.builder().id("h1").inspectionExpiryDate(LocalDate.of(2027, 12, 31))
                .maxCrewWeightKg(50).rangeKm(999).build()
        helicopterRepository.findById("h1") >> Optional.of(smallHeli)
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)

        def order = FlightOrder.builder().pilotId("pilot1").helicopterId("h1")
                .plannedDeparture(LocalDateTime.of(2026, 7, 1, 8, 0))
                .crewWeightKg(82).estimatedRouteLengthKm(100).build()

        when:
        service.validateFlightRules(order)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("Waga załogi")
    }

    def "rule 5: reject route exceeding range"() {
        given:
        def shortRangeHeli = Helicopter.builder().id("h1").inspectionExpiryDate(LocalDate.of(2027, 12, 31))
                .maxCrewWeightKg(999).rangeKm(50).build()
        helicopterRepository.findById("h1") >> Optional.of(shortRangeHeli)
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)

        def order = FlightOrder.builder().pilotId("pilot1").helicopterId("h1")
                .plannedDeparture(LocalDateTime.of(2026, 7, 1, 8, 0))
                .crewWeightKg(82).estimatedRouteLengthKm(100).build()

        when:
        service.validateFlightRules(order)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("Szacowana trasa")
    }

    def "all rules pass for valid order"() {
        given:
        helicopterRepository.findById("h1") >> Optional.of(heli)
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)

        def order = FlightOrder.builder().pilotId("pilot1").helicopterId("h1")
                .plannedDeparture(LocalDateTime.of(2026, 7, 1, 8, 0))
                .crewWeightKg(82).estimatedRouteLengthKm(100).build()

        when:
        service.validateFlightRules(order)

        then:
        noExceptionThrown()
    }

    // --- 55-SC-AERO: Status transitions ---

    def "submitForApproval: SUBMITTED -> SENT_FOR_APPROVAL by PILOT"() {
        given:
        def order = FlightOrder.builder().id("fo1").status(OrderStatus.SUBMITTED).build()
        orderRepository.findById("fo1") >> Optional.of(order)
        orderRepository.save(_) >> { FlightOrder o -> o }

        when:
        def result = service.changeStatus("fo1", "submitForApproval", UserRole.PILOT, "pilot@aero.pl")

        then:
        result.status == OrderStatus.SENT_FOR_APPROVAL
    }

    def "approve: SENT_FOR_APPROVAL -> APPROVED by SUPERVISOR"() {
        given:
        def order = FlightOrder.builder().id("fo1").status(OrderStatus.SENT_FOR_APPROVAL).build()
        orderRepository.findById("fo1") >> Optional.of(order)
        orderRepository.save(_) >> { FlightOrder o -> o }

        when:
        def result = service.changeStatus("fo1", "approve", UserRole.SUPERVISOR, "nadzor@aero.pl")

        then:
        result.status == OrderStatus.APPROVED
    }

    def "complete: requires actual dates"() {
        given:
        def order = FlightOrder.builder().id("fo1").status(OrderStatus.APPROVED)
                .actualDeparture(null).actualArrival(null).operationIds([]).build()
        orderRepository.findById("fo1") >> Optional.of(order)

        when:
        service.changeStatus("fo1", "complete", UserRole.PILOT, "pilot@aero.pl")

        then:
        thrown(IllegalArgumentException)
    }

    def "complete: APPROVED -> COMPLETED cascades operations"() {
        given:
        def order = FlightOrder.builder().id("fo1").status(OrderStatus.APPROVED)
                .actualDeparture(LocalDateTime.now()).actualArrival(LocalDateTime.now())
                .operationIds(["op1", "op2"]).build()
        orderRepository.findById("fo1") >> Optional.of(order)
        orderRepository.save(_) >> { FlightOrder o -> o }

        when:
        def result = service.changeStatus("fo1", "complete", UserRole.PILOT, "pilot@aero.pl")

        then:
        result.status == OrderStatus.COMPLETED
        1 * operationService.changeStatus("op1", "complete", null, "pilot@aero.pl")
        1 * operationService.changeStatus("op2", "complete", null, "pilot@aero.pl")
    }

    def "notCompleted: cascades operations back to CONFIRMED"() {
        given:
        def order = FlightOrder.builder().id("fo1").status(OrderStatus.APPROVED)
                .operationIds(["op1"]).build()
        orderRepository.findById("fo1") >> Optional.of(order)
        orderRepository.save(_) >> { FlightOrder o -> o }

        when:
        def result = service.changeStatus("fo1", "notCompleted", UserRole.PILOT, "pilot@aero.pl")

        then:
        result.status == OrderStatus.NOT_COMPLETED
        1 * operationService.changeStatus("op1", "unschedule", null, "pilot@aero.pl")
    }

    def "supervisor cannot submit for approval"() {
        given:
        def order = FlightOrder.builder().id("fo1").status(OrderStatus.SUBMITTED).build()
        orderRepository.findById("fo1") >> Optional.of(order)

        when:
        service.changeStatus("fo1", "submitForApproval", UserRole.SUPERVISOR, "nadzor@aero.pl")

        then:
        thrown(AccessDeniedException)
    }

    // --- 56-SC-AERO: Cascading ---

    def "create should schedule linked operations"() {
        given:
        def user = User.builder().email("pilot@aero.pl").crewMemberId("pilot1").build()
        userRepository.findByEmail("pilot@aero.pl") >> Optional.of(user)
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)
        helicopterRepository.findById("h1") >> Optional.of(heli)
        operationRepository.findById("op1") >> Optional.of(confirmedOp)
        orderRepository.save(_) >> { FlightOrder o -> o }

        def order = FlightOrder.builder()
                .plannedDeparture(LocalDateTime.of(2026, 7, 1, 8, 0))
                .plannedArrival(LocalDateTime.of(2026, 7, 1, 12, 0))
                .helicopterId("h1").departureSiteId("s1").arrivalSiteId("s2")
                .operationIds(["op1"]).build()

        when:
        service.create(order, "pilot@aero.pl")

        then:
        1 * operationService.changeStatus("op1", "schedule", null, "system")
    }
}
