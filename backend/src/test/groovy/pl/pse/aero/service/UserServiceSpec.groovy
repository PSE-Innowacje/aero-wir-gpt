package pl.pse.aero.service

import org.springframework.security.crypto.password.PasswordEncoder
import pl.pse.aero.domain.CrewMember
import pl.pse.aero.domain.User
import pl.pse.aero.domain.UserRole
import pl.pse.aero.dto.UserRequest
import pl.pse.aero.repository.CrewMemberRepository
import pl.pse.aero.repository.UserRepository
import spock.lang.Specification

class UserServiceSpec extends Specification {

    UserRepository userRepository = Mock()
    CrewMemberRepository crewMemberRepository = Mock()
    PasswordEncoder passwordEncoder = Mock()
    UserService service = new UserService(userRepository, crewMemberRepository, passwordEncoder)

    def setup() {
        crewMemberRepository.save(_) >> { CrewMember c -> c.id = "auto-crew-id"; c }
    }

    def "findAll should return users sorted by email"() {
        given:
        def u1 = User.builder().email("zzz@aero.pl").build()
        def u2 = User.builder().email("aaa@aero.pl").build()
        userRepository.findAll() >> [u1, u2]

        when:
        def result = service.findAll()

        then:
        result*.email == ["aaa@aero.pl", "zzz@aero.pl"]
    }

    def "create should hash password and save user"() {
        given:
        def request = UserRequest.builder()
                .firstName("Jan")
                .lastName("Kowalski")
                .email("jan@aero.pl")
                .password("secret")
                .role(UserRole.PILOT)
                .crewMemberId("c1")
                .build()
        passwordEncoder.encode("secret") >> "bcrypt(secret)"
        userRepository.save(_) >> { User u -> u }

        when:
        def result = service.create(request)

        then:
        result.email == "jan@aero.pl"
        result.passwordHash == "bcrypt(secret)"
        result.role == UserRole.PILOT
        result.crewMemberId == "c1"
    }

    def "create should reject when password is missing"() {
        given:
        def request = UserRequest.builder()
                .firstName("No")
                .lastName("Pass")
                .email("no@aero.pl")
                .password(null)
                .role(UserRole.ADMIN)
                .build()

        when:
        service.create(request)

        then:
        thrown(IllegalArgumentException)
    }

    def "update should change fields but keep password if not provided"() {
        given:
        def existing = User.builder()
                .id("u1")
                .email("old@aero.pl")
                .passwordHash("old-hash")
                .role(UserRole.ADMIN)
                .build()
        userRepository.findById("u1") >> Optional.of(existing)
        userRepository.save(_) >> { User u -> u }

        def request = UserRequest.builder()
                .firstName("Updated")
                .lastName("User")
                .email("new@aero.pl")
                .password(null)
                .role(UserRole.SUPERVISOR)
                .build()

        when:
        def result = service.update("u1", request)

        then:
        result.email == "new@aero.pl"
        result.role == UserRole.SUPERVISOR
        result.passwordHash == "old-hash"
        0 * passwordEncoder.encode(_)
    }

    def "update should rehash password when provided"() {
        given:
        def existing = User.builder()
                .id("u1")
                .email("user@aero.pl")
                .passwordHash("old-hash")
                .role(UserRole.ADMIN)
                .build()
        userRepository.findById("u1") >> Optional.of(existing)
        userRepository.save(_) >> { User u -> u }
        passwordEncoder.encode("newpass") >> "bcrypt(newpass)"

        def request = UserRequest.builder()
                .firstName("Same")
                .lastName("User")
                .email("user@aero.pl")
                .password("newpass")
                .role(UserRole.ADMIN)
                .build()

        when:
        def result = service.update("u1", request)

        then:
        result.passwordHash == "bcrypt(newpass)"
    }

    def "findById should throw when not found"() {
        given:
        userRepository.findById("missing") >> Optional.empty()

        when:
        service.findById("missing")

        then:
        thrown(NoSuchElementException)
    }
}
