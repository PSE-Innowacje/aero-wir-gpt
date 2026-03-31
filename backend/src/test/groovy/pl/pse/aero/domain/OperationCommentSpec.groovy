package pl.pse.aero.domain

import spock.lang.Specification

import java.time.LocalDateTime

class OperationCommentSpec extends Specification {

    def "should create comment with all fields"() {
        when:
        def comment = OperationComment.builder()
                .content("Proszę o priorytetowe traktowanie")
                .authorEmail("planista@aero.pl")
                .build()

        then:
        comment.content == "Proszę o priorytetowe traktowanie"
        comment.authorEmail == "planista@aero.pl"
        comment.createdAt != null
    }

    def "should auto-set createdAt to now"() {
        given:
        def before = LocalDateTime.now()

        when:
        def comment = OperationComment.builder()
                .content("test")
                .authorEmail("a@b.pl")
                .build()

        then:
        !comment.createdAt.isBefore(before)
    }
}
