package pl.pse.aero.domain

import spock.lang.Specification

class UserSpec extends Specification {

    def "should create user with all fields via builder"() {
        when:
        def user = User.builder()
                .id("user-1")
                .firstName("Jan")
                .lastName("Kowalski")
                .email("jan@aero.pl")
                .passwordHash("hashed")
                .role(UserRole.PILOT)
                .crewMemberId("crew-1")
                .build()

        then:
        user.id == "user-1"
        user.firstName == "Jan"
        user.lastName == "Kowalski"
        user.email == "jan@aero.pl"
        user.passwordHash == "hashed"
        user.role == UserRole.PILOT
        user.crewMemberId == "crew-1"
    }

    def "should allow null crewMemberId for non-pilot users"() {
        when:
        def user = User.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@aero.pl")
                .passwordHash("hashed")
                .role(UserRole.ADMIN)
                .build()

        then:
        user.crewMemberId == null
    }

    def "should support all roles: #role"() {
        when:
        def user = User.builder()
                .email("test@aero.pl")
                .role(role)
                .build()

        then:
        user.role == role

        where:
        role << UserRole.values()
    }

    def "should update fields via setters"() {
        given:
        def user = new User()

        when:
        user.email = "new@aero.pl"
        user.role = UserRole.SUPERVISOR

        then:
        user.email == "new@aero.pl"
        user.role == UserRole.SUPERVISOR
    }
}
