package pl.pse.aero.controller

import pl.pse.aero.domain.ActivityType
import pl.pse.aero.domain.OperationStatus
import pl.pse.aero.domain.OrderStatus
import spock.lang.Specification

class DictionaryControllerSpec extends Specification {

    DictionaryController controller = new DictionaryController()

    def "activityTypes should return all 5 activity types with Polish labels"() {
        when:
        def result = controller.activityTypes().body

        then:
        result.size() == 5
        result*.value.containsAll(ActivityType.values()*.name())
        result.find { it.value == "VISUAL_INSPECTION" }.label == "Oględziny wizualne"
        result.find { it.value == "PATROL" }.label == "Patrolowanie"
    }

    def "crewRoles should return PILOT and OBSERVER with Polish labels"() {
        when:
        def result = controller.crewRoles().body

        then:
        result.size() == 2
        result.find { it.value == "PILOT" }.label == "Pilot"
        result.find { it.value == "OBSERVER" }.label == "Obserwator"
    }

    def "operationStatuses should return all 7 statuses"() {
        when:
        def result = controller.operationStatuses().body

        then:
        result.size() == 7
        result*.value.containsAll(OperationStatus.values()*.name())
        result.find { it.value == "SUBMITTED" }.label == "Wprowadzone"
        result.find { it.value == "CANCELLED" }.label == "Rezygnacja"
    }

    def "orderStatuses should return all 7 statuses"() {
        when:
        def result = controller.orderStatuses().body

        then:
        result.size() == 7
        result*.value.containsAll(OrderStatus.values()*.name())
        result.find { it.value == "SENT_FOR_APPROVAL" }.label == "Przekazane do akceptacji"
        result.find { it.value == "NOT_COMPLETED" }.label == "Nie zrealizowane"
    }
}
