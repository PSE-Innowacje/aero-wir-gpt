package pl.pse.aero.security

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.http.HttpServletResponse
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.authentication.BadCredentialsException
import spock.lang.Specification

class CustomAuthenticationEntryPointSpec extends Specification {

    ObjectMapper objectMapper = new ObjectMapper()
    CustomAuthenticationEntryPoint entryPoint = new CustomAuthenticationEntryPoint(objectMapper)

    def "should return 401 status with JSON body"() {
        given:
        def request = new MockHttpServletRequest()
        def response = new MockHttpServletResponse()
        def exception = new BadCredentialsException("bad creds")

        when:
        entryPoint.commence(request, response, exception)

        then:
        response.status == HttpServletResponse.SC_UNAUTHORIZED
        response.contentType == "application/json"

        and:
        def body = objectMapper.readValue(response.contentAsString, Map)
        body.status == 401
        body.message == "Unauthorized"
    }
}
