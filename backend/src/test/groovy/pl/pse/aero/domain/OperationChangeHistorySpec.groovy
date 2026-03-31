package pl.pse.aero.domain

import spock.lang.Specification

import java.time.LocalDateTime

class OperationChangeHistorySpec extends Specification {

    def "should create change history entry with all fields"() {
        when:
        def entry = OperationChangeHistory.builder()
                .fieldName("status")
                .oldValue("SUBMITTED")
                .newValue("CONFIRMED")
                .changedByEmail("nadzor@aero.pl")
                .build()

        then:
        entry.fieldName == "status"
        entry.oldValue == "SUBMITTED"
        entry.newValue == "CONFIRMED"
        entry.changedByEmail == "nadzor@aero.pl"
        entry.changedAt != null
    }

    def "should allow null oldValue for new fields"() {
        when:
        def entry = OperationChangeHistory.builder()
                .fieldName("additionalInfo")
                .oldValue(null)
                .newValue("Some info")
                .changedByEmail("admin@aero.pl")
                .build()

        then:
        entry.oldValue == null
        entry.newValue == "Some info"
    }

    def "should auto-set changedAt to now"() {
        given:
        def before = LocalDateTime.now()

        when:
        def entry = OperationChangeHistory.builder()
                .fieldName("x")
                .changedByEmail("a@b.pl")
                .build()

        then:
        !entry.changedAt.isBefore(before)
    }
}
