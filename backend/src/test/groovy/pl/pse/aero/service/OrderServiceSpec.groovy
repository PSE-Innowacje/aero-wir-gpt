package pl.pse.aero.service

import pl.pse.aero.domain.*
import pl.pse.aero.repository.*
import spock.lang.Specification

import java.time.LocalDateTime

class OrderServiceSpec extends Specification {

    FlightOrderRepository orderRepository = Mock()
    CrewMemberRepository crewMemberRepository = Mock()
    FlightOperationRepository operationRepository = Mock()
    UserRepository userRepository = Mock()

    OrderService service = new OrderService(
            orderRepository, crewMemberRepository, operationRepository, userRepository)

    def pilot = CrewMember.builder().id("pilot1").email("pilot@aero.pl").weightKg(82).role(CrewRole.PILOT).build()
    def crew1 = CrewMember.builder().id("crew1").weightKg(75).role(CrewRole.OBSERVER).build()
    def confirmedOp = FlightOperation.builder().id("op1").status(OperationStatus.CONFIRMED).routeLengthKm(100).build()

    def "create should auto-fill pilotId from user's crewMemberId"() {
        given:
        def user = User.builder().email("pilot@aero.pl").crewMemberId("pilot1").build()
        userRepository.findByEmail("pilot@aero.pl") >> Optional.of(user)
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)
        operationRepository.findById("op1") >> Optional.of(confirmedOp)
        orderRepository.save(_) >> { FlightOrder o -> o }

        def order = FlightOrder.builder()
                .plannedDeparture(LocalDateTime.of(2026, 7, 1, 8, 0))
                .plannedArrival(LocalDateTime.of(2026, 7, 1, 12, 0))
                .helicopterId("h1")
                .departureSiteId("s1")
                .arrivalSiteId("s2")
                .operationIds(["op1"])
                .build()

        when:
        def result = service.create(order, "pilot@aero.pl")

        then:
        result.pilotId == "pilot1"
        result.status == OrderStatus.SUBMITTED
    }

    def "create should throw when user has no linked crew member"() {
        given:
        def user = User.builder().email("pilot@aero.pl").crewMemberId(null).build()
        userRepository.findByEmail("pilot@aero.pl") >> Optional.of(user)

        when:
        service.create(FlightOrder.builder().build(), "pilot@aero.pl")

        then:
        thrown(IllegalStateException)
    }

    def "create should auto-calculate crew weight (pilot + crew)"() {
        given:
        def user = User.builder().email("pilot@aero.pl").crewMemberId("pilot1").build()
        userRepository.findByEmail("pilot@aero.pl") >> Optional.of(user)
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)
        crewMemberRepository.findById("crew1") >> Optional.of(crew1)
        operationRepository.findById("op1") >> Optional.of(confirmedOp)
        orderRepository.save(_) >> { FlightOrder o -> o }

        def order = FlightOrder.builder()
                .plannedDeparture(LocalDateTime.now())
                .plannedArrival(LocalDateTime.now())
                .helicopterId("h1")
                .departureSiteId("s1")
                .arrivalSiteId("s2")
                .crewMemberIds(["crew1"])
                .operationIds(["op1"])
                .build()

        when:
        def result = service.create(order, "pilot@aero.pl")

        then:
        result.crewWeightKg == 82 + 75  // pilot + crew1
    }

    def "create should auto-calculate route length from operations"() {
        given:
        def user = User.builder().email("pilot@aero.pl").crewMemberId("pilot1").build()
        def op2 = FlightOperation.builder().id("op2").status(OperationStatus.CONFIRMED).routeLengthKm(50).build()
        userRepository.findByEmail("pilot@aero.pl") >> Optional.of(user)
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)
        operationRepository.findById("op1") >> Optional.of(confirmedOp)
        operationRepository.findById("op2") >> Optional.of(op2)
        orderRepository.save(_) >> { FlightOrder o -> o }

        def order = FlightOrder.builder()
                .plannedDeparture(LocalDateTime.now())
                .plannedArrival(LocalDateTime.now())
                .helicopterId("h1")
                .departureSiteId("s1")
                .arrivalSiteId("s2")
                .operationIds(["op1", "op2"])
                .build()

        when:
        def result = service.create(order, "pilot@aero.pl")

        then:
        result.estimatedRouteLengthKm == 150  // 100 + 50
    }

    def "create should reject non-CONFIRMED operations"() {
        given:
        def user = User.builder().email("pilot@aero.pl").crewMemberId("pilot1").build()
        def submittedOp = FlightOperation.builder().id("op1").status(OperationStatus.SUBMITTED).build()
        userRepository.findByEmail("pilot@aero.pl") >> Optional.of(user)
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)
        operationRepository.findById("op1") >> Optional.of(submittedOp)

        def order = FlightOrder.builder()
                .plannedDeparture(LocalDateTime.now())
                .plannedArrival(LocalDateTime.now())
                .helicopterId("h1")
                .departureSiteId("s1")
                .arrivalSiteId("s2")
                .operationIds(["op1"])
                .build()

        when:
        service.create(order, "pilot@aero.pl")

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("CONFIRMED")
    }

    def "calculateCrewWeight should sum pilot and all crew weights"() {
        given:
        crewMemberRepository.findById("pilot1") >> Optional.of(pilot)
        crewMemberRepository.findById("crew1") >> Optional.of(crew1)

        expect:
        service.calculateCrewWeight("pilot1", ["crew1"]) == 157
    }

    def "calculateRouteLength should sum operation route lengths"() {
        given:
        def op2 = FlightOperation.builder().id("op2").routeLengthKm(200).build()
        operationRepository.findById("op1") >> Optional.of(confirmedOp)
        operationRepository.findById("op2") >> Optional.of(op2)

        expect:
        service.calculateRouteLength(["op1", "op2"]) == 300
    }

    def "findAll should sort by plannedDeparture ASC"() {
        given:
        def o1 = FlightOrder.builder().id("fo1").plannedDeparture(LocalDateTime.of(2026, 8, 1, 8, 0)).status(OrderStatus.SENT_FOR_APPROVAL).build()
        def o2 = FlightOrder.builder().id("fo2").plannedDeparture(LocalDateTime.of(2026, 7, 1, 8, 0)).status(OrderStatus.SENT_FOR_APPROVAL).build()
        orderRepository.findByStatus(OrderStatus.SENT_FOR_APPROVAL) >> [o1, o2]

        when:
        def result = service.findAll(OrderStatus.SENT_FOR_APPROVAL)

        then:
        result*.id == ["fo2", "fo1"]
    }
}
