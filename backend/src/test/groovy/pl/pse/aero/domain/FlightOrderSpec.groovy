package pl.pse.aero.domain

import spock.lang.Specification

import java.time.LocalDateTime

class FlightOrderSpec extends Specification {

    def "should create flight order with all fields"() {
        when:
        def order = FlightOrder.builder()
                .id("fo1")
                .plannedDeparture(LocalDateTime.of(2026, 7, 1, 8, 0))
                .plannedArrival(LocalDateTime.of(2026, 7, 1, 12, 0))
                .pilotId("pilot1")
                .helicopterId("heli1")
                .departureSiteId("site1")
                .arrivalSiteId("site2")
                .crewMemberIds(["crew1", "crew2"])
                .operationIds(["op1", "op2"])
                .crewWeightKg(250)
                .estimatedRouteLengthKm(180)
                .build()

        then:
        order.pilotId == "pilot1"
        order.helicopterId == "heli1"
        order.crewMemberIds.size() == 2
        order.operationIds.size() == 2
        order.crewWeightKg == 250
        order.estimatedRouteLengthKm == 180
        order.status == OrderStatus.SUBMITTED
    }

    def "should default status to SUBMITTED"() {
        when:
        def order = FlightOrder.builder()
                .plannedDeparture(LocalDateTime.now())
                .plannedArrival(LocalDateTime.now())
                .build()

        then:
        order.status == OrderStatus.SUBMITTED
    }

    def "should default lists to empty"() {
        when:
        def order = FlightOrder.builder().build()

        then:
        order.crewMemberIds != null
        order.crewMemberIds.isEmpty()
        order.operationIds != null
        order.operationIds.isEmpty()
    }

    def "prePersist should set timestamps"() {
        given:
        def order = FlightOrder.builder().build()
        def before = LocalDateTime.now()

        when:
        order.prePersist()

        then:
        order.createdAt != null
        order.updatedAt != null
        !order.createdAt.isBefore(before)
    }

    def "OrderStatus should have correct codes"() {
        expect:
        OrderStatus.fromCode(1) == OrderStatus.SUBMITTED
        OrderStatus.fromCode(2) == OrderStatus.SENT_FOR_APPROVAL
        OrderStatus.fromCode(7) == OrderStatus.NOT_COMPLETED
        OrderStatus.values().length == 7
    }
}
