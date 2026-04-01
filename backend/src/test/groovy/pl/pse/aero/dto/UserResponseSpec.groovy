package pl.pse.aero.dto

import pl.pse.aero.domain.User
import pl.pse.aero.domain.UserRole
import spock.lang.Specification

class UserResponseSpec extends Specification {

    def "should map User entity to UserResponse"() {
        given:
        def user = User.builder()
                .id("u1")
                .email("pilot@aero.pl")
                .firstName("Jan")
                .lastName("Kowalski")
                .role(UserRole.PILOT)
                .passwordHash("secret")
                .crewMemberId("c1")
                .build()

        when:
        def response = UserResponse.from(user)

        then:
        response.id == "u1"
        response.email == "pilot@aero.pl"
        response.firstName == "Jan"
        response.lastName == "Kowalski"
        response.role == UserRole.PILOT
    }

    def "should expose crewMemberId but not passwordHash"() {
        given:
        def user = User.builder()
                .id("u1")
                .email("a@b.pl")
                .passwordHash("secret")
                .crewMemberId("c1")
                .role(UserRole.ADMIN)
                .build()

        when:
        def response = UserResponse.from(user)

        then:
        !response.hasProperty("passwordHash")
        response.crewMemberId == "c1"
    }
}
