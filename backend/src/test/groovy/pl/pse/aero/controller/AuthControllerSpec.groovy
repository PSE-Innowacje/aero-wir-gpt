package pl.pse.aero.controller

import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import pl.pse.aero.domain.User
import pl.pse.aero.domain.UserRole
import pl.pse.aero.dto.LoginRequest
import pl.pse.aero.repository.UserRepository
import spock.lang.Specification

class AuthControllerSpec extends Specification {

    AuthenticationManager authManager = Mock()
    UserRepository userRepository = Mock()
    AuthController controller = new AuthController(authManager, userRepository)

    def pilotUser = User.builder()
            .id("u1")
            .email("pilot@aero.pl")
            .firstName("Jan")
            .lastName("Kowalski")
            .passwordHash("hashed")
            .role(UserRole.PILOT)
            .build()

    def "login should return UserResponse on valid credentials"() {
        given:
        def request = new LoginRequest("pilot@aero.pl", "password")
        def httpRequest = new MockHttpServletRequest()
        def auth = Mock(Authentication) { isAuthenticated() >> true }

        authManager.authenticate(_) >> auth
        userRepository.findByEmail("pilot@aero.pl") >> Optional.of(pilotUser)

        when:
        def response = controller.login(request, httpRequest)

        then:
        response.statusCode == HttpStatus.OK
        response.body.email == "pilot@aero.pl"
        response.body.role == UserRole.PILOT
    }

    def "login should return 401 on bad credentials"() {
        given:
        def request = new LoginRequest("pilot@aero.pl", "wrong")
        def httpRequest = new MockHttpServletRequest()

        authManager.authenticate(_) >> { throw new BadCredentialsException("bad") }

        when:
        def response = controller.login(request, httpRequest)

        then:
        response.statusCode == HttpStatus.UNAUTHORIZED
        response.body.message == "Invalid credentials"
    }

    def "logout should return 200"() {
        given:
        def httpRequest = new MockHttpServletRequest()
        httpRequest.getSession(true)

        when:
        def response = controller.logout(httpRequest)

        then:
        response.statusCode == HttpStatus.OK
    }

    def "me should return UserResponse when authenticated"() {
        given:
        def auth = Mock(Authentication) {
            isAuthenticated() >> true
            getName() >> "pilot@aero.pl"
        }
        userRepository.findByEmail("pilot@aero.pl") >> Optional.of(pilotUser)

        when:
        def response = controller.me(auth)

        then:
        response.statusCode == HttpStatus.OK
        response.body.email == "pilot@aero.pl"
        response.body.firstName == "Jan"
    }

    def "me should return 401 when not authenticated"() {
        when:
        def response = controller.me(null)

        then:
        response.statusCode == HttpStatus.UNAUTHORIZED
    }
}
