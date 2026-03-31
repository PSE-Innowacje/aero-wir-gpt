package pl.pse.aero.domain

import spock.lang.Specification

class OperationStatusSpec extends Specification {

    def "should define exactly 7 statuses"() {
        expect:
        OperationStatus.values().length == 7
    }

    def "should have correct code for #status"() {
        expect:
        status.code == expectedCode

        where:
        status                                  || expectedCode
        OperationStatus.SUBMITTED               || 1
        OperationStatus.REJECTED                || 2
        OperationStatus.CONFIRMED               || 3
        OperationStatus.SCHEDULED               || 4
        OperationStatus.PARTIALLY_COMPLETED     || 5
        OperationStatus.COMPLETED               || 6
        OperationStatus.CANCELLED               || 7
    }

    def "fromCode should return correct status for code #code"() {
        expect:
        OperationStatus.fromCode(code) == expected

        where:
        code || expected
        1    || OperationStatus.SUBMITTED
        2    || OperationStatus.REJECTED
        3    || OperationStatus.CONFIRMED
        4    || OperationStatus.SCHEDULED
        5    || OperationStatus.PARTIALLY_COMPLETED
        6    || OperationStatus.COMPLETED
        7    || OperationStatus.CANCELLED
    }

    def "fromCode should throw for unknown code"() {
        when:
        OperationStatus.fromCode(99)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("99")
    }

    def "getLabel should return Polish text for #status"() {
        expect:
        status.label == expectedLabel

        where:
        status                             || expectedLabel
        OperationStatus.SUBMITTED          || "Wprowadzone"
        OperationStatus.CANCELLED          || "Rezygnacja"
        OperationStatus.CONFIRMED          || "Potwierdzone do planu"
    }
}
