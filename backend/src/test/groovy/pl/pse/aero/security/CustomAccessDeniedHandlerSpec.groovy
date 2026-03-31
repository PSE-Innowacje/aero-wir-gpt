package pl.pse.aero.security

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.servlet.http.HttpServletResponse
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.access.AccessDeniedException
import spock.lang.Specification

class CustomAccessDeniedHandlerSpec extends Specification {

    ObjectMapper objectMapper = new ObjectMapper()
    CustomAccessDeniedHandler handler = new CustomAccessDeniedHandler(objectMapper)

    def "should return 403 status with JSON body"() {
        given:
        def request = new MockHttpServletRequest()
        def response = new MockHttpServletResponse()
        def exception = new AccessDeniedException("forbidden")

        when:
        handler.handle(request, response, exception)

        then:
        response.status == HttpServletResponse.SC_FORBIDDEN
        response.contentType == "application/json"

        and:
        def body = objectMapper.readValue(response.contentAsString, Map)
        body.status == 403
        body.message == "Access denied"
    }
}
