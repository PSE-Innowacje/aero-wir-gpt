package pl.pse.aero.security

import org.springframework.security.core.userdetails.UsernameNotFoundException
import pl.pse.aero.domain.User
import pl.pse.aero.domain.UserRole
import pl.pse.aero.repository.UserRepository
import spock.lang.Specification

class CustomUserDetailsServiceSpec extends Specification {

    UserRepository userRepository = Mock()
    CustomUserDetailsService service = new CustomUserDetailsService(userRepository)

    def "should load user by email and map to UserDetails"() {
        given:
        def user = User.builder()
                .id("u1")
                .email("pilot@aero.pl")
                .passwordHash("bcrypt-hash")
                .role(UserRole.PILOT)
                .build()
        userRepository.findByEmail("pilot@aero.pl") >> Optional.of(user)

        when:
        def details = service.loadUserByUsername("pilot@aero.pl")

        then:
        details.username == "pilot@aero.pl"
        details.password == "bcrypt-hash"
        details.authorities*.authority == ["ROLE_PILOT"]
    }

    def "should map role correctly for each UserRole: #role"() {
        given:
        def user = User.builder()
                .email("test@aero.pl")
                .passwordHash("hash")
                .role(role)
                .build()
        userRepository.findByEmail("test@aero.pl") >> Optional.of(user)

        when:
        def details = service.loadUserByUsername("test@aero.pl")

        then:
        details.authorities*.authority == ["ROLE_" + role.name()]

        where:
        role << UserRole.values()
    }

    def "should throw UsernameNotFoundException when user not found"() {
        given:
        userRepository.findByEmail("nobody@aero.pl") >> Optional.empty()

        when:
        service.loadUserByUsername("nobody@aero.pl")

        then:
        thrown(UsernameNotFoundException)
    }
}
