package pl.pse.aero.service

import pl.pse.aero.domain.CrewMember
import pl.pse.aero.domain.CrewRole
import pl.pse.aero.dto.CrewMemberRequest
import pl.pse.aero.repository.CrewMemberRepository
import spock.lang.Specification

import java.time.LocalDate

class CrewMemberServiceSpec extends Specification {

    CrewMemberRepository repository = Mock()
    CrewMemberService service = new CrewMemberService(repository)

    def "findAll should return crew members sorted by email"() {
        given:
        def m1 = CrewMember.builder().email("zzzz@aero.pl").build()
        def m2 = CrewMember.builder().email("aaaa@aero.pl").build()
        def m3 = CrewMember.builder().email("mmmm@aero.pl").build()
        repository.findAll() >> [m1, m2, m3]

        when:
        def result = service.findAll()

        then:
        result*.email == ["aaaa@aero.pl", "mmmm@aero.pl", "zzzz@aero.pl"]
    }

    def "create should save pilot with valid license data"() {
        given:
        def request = CrewMemberRequest.builder()
                .firstName("Jan")
                .lastName("Kowalski")
                .email("jan@aero.pl")
                .weightKg(80)
                .role(CrewRole.PILOT)
                .pilotLicenseNumber("PL-001")
                .licenseExpiryDate(LocalDate.of(2027, 6, 30))
                .trainingExpiryDate(LocalDate.of(2026, 12, 31))
                .build()
        repository.save(_) >> { CrewMember m -> m }

        when:
        def result = service.create(request)

        then:
        result.firstName == "Jan"
        result.role == CrewRole.PILOT
        result.pilotLicenseNumber == "PL-001"
    }

    def "create should reject pilot without license number"() {
        given:
        def request = CrewMemberRequest.builder()
                .firstName("Bad")
                .lastName("Pilot")
                .email("bad@aero.pl")
                .weightKg(80)
                .role(CrewRole.PILOT)
                .pilotLicenseNumber(null)
                .licenseExpiryDate(LocalDate.of(2027, 6, 30))
                .trainingExpiryDate(LocalDate.of(2026, 12, 31))
                .build()

        when:
        service.create(request)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("license number")
    }

    def "create should reject pilot without license expiry date"() {
        given:
        def request = CrewMemberRequest.builder()
                .firstName("Bad")
                .lastName("Pilot")
                .email("bad@aero.pl")
                .weightKg(80)
                .role(CrewRole.PILOT)
                .pilotLicenseNumber("PL-001")
                .licenseExpiryDate(null)
                .trainingExpiryDate(LocalDate.of(2026, 12, 31))
                .build()

        when:
        service.create(request)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("license expiry date")
    }

    def "create should allow observer without pilot fields"() {
        given:
        def request = CrewMemberRequest.builder()
                .firstName("Anna")
                .lastName("Nowak")
                .email("anna@aero.pl")
                .weightKg(65)
                .role(CrewRole.OBSERVER)
                .trainingExpiryDate(LocalDate.of(2026, 12, 31))
                .build()
        repository.save(_) >> { CrewMember m -> m }

        when:
        def result = service.create(request)

        then:
        result.role == CrewRole.OBSERVER
        result.pilotLicenseNumber == null
        result.licenseExpiryDate == null
    }

    def "update should modify existing crew member"() {
        given:
        def existing = CrewMember.builder().id("c1").email("old@aero.pl").role(CrewRole.OBSERVER).build()
        repository.findById("c1") >> Optional.of(existing)
        repository.save(_) >> { CrewMember m -> m }

        def request = CrewMemberRequest.builder()
                .firstName("Updated")
                .lastName("Member")
                .email("new@aero.pl")
                .weightKg(75)
                .role(CrewRole.OBSERVER)
                .trainingExpiryDate(LocalDate.of(2027, 1, 1))
                .build()

        when:
        def result = service.update("c1", request)

        then:
        result.id == "c1"
        result.email == "new@aero.pl"
        result.firstName == "Updated"
    }

    def "findById should throw when not found"() {
        given:
        repository.findById("missing") >> Optional.empty()

        when:
        service.findById("missing")

        then:
        thrown(NoSuchElementException)
    }
}
