package pl.pse.aero.domain

import spock.lang.Specification

import java.time.LocalDate

class CrewMemberSpec extends Specification {

    def "should create crew member with all fields via builder"() {
        when:
        def member = CrewMember.builder()
                .id("c1")
                .firstName("Jan")
                .lastName("Kowalski")
                .email("jan@aero.pl")
                .weightKg(85)
                .role(CrewRole.PILOT)
                .pilotLicenseNumber("PL-12345")
                .licenseExpiryDate(LocalDate.of(2027, 6, 30))
                .trainingExpiryDate(LocalDate.of(2026, 12, 31))
                .build()

        then:
        member.firstName == "Jan"
        member.lastName == "Kowalski"
        member.email == "jan@aero.pl"
        member.weightKg == 85
        member.role == CrewRole.PILOT
        member.pilotLicenseNumber == "PL-12345"
        member.licenseExpiryDate == LocalDate.of(2027, 6, 30)
        member.trainingExpiryDate == LocalDate.of(2026, 12, 31)
    }

    def "should allow null pilot fields for OBSERVER role"() {
        when:
        def member = CrewMember.builder()
                .firstName("Anna")
                .lastName("Nowak")
                .email("anna@aero.pl")
                .weightKg(65)
                .role(CrewRole.OBSERVER)
                .trainingExpiryDate(LocalDate.of(2026, 12, 31))
                .build()

        then:
        member.pilotLicenseNumber == null
        member.licenseExpiryDate == null
    }

    def "CrewRole should define exactly 2 values"() {
        expect:
        CrewRole.values().length == 2
        CrewRole.values() as Set == [CrewRole.PILOT, CrewRole.OBSERVER] as Set
    }
}
