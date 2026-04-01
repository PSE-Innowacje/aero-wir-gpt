package pl.pse.aero.config

import org.springframework.security.crypto.password.PasswordEncoder
import pl.pse.aero.domain.*
import pl.pse.aero.repository.*
import pl.pse.aero.service.KmlService
import spock.lang.Specification

class DataInitializerSpec extends Specification {

    UserRepository userRepository = Mock()
    HelicopterRepository helicopterRepository = Mock()
    CrewMemberRepository crewMemberRepository = Mock()
    LandingSiteRepository landingSiteRepository = Mock()
    FlightOperationRepository flightOperationRepository = Mock()
    KmlService kmlService = Mock()
    PasswordEncoder passwordEncoder = Mock()

    DataInitializer initializer = new DataInitializer(
            userRepository, helicopterRepository, crewMemberRepository,
            landingSiteRepository, flightOperationRepository, kmlService, passwordEncoder)

    def "should seed users when empty and skip others"() {
        given:
        userRepository.count() >> 0L
        helicopterRepository.count() >> 1L
        crewMemberRepository.count() >> 1L
        crewMemberRepository.findByRole(CrewRole.PILOT) >> []
        landingSiteRepository.count() >> 1L
        flightOperationRepository.count() >> 1L
        passwordEncoder.encode(_) >> "hash"

        when:
        initializer.run()

        then:
        1 * userRepository.saveAll({ it.size() == 5 })
        0 * helicopterRepository.saveAll(_)
    }

    def "should seed helicopters when empty"() {
        given:
        userRepository.count() >> 1L
        helicopterRepository.count() >> 0L
        crewMemberRepository.count() >> 1L
        crewMemberRepository.findByRole(CrewRole.PILOT) >> []
        landingSiteRepository.count() >> 1L
        flightOperationRepository.count() >> 1L
        passwordEncoder.encode(_) >> "hash"

        when:
        initializer.run()

        then:
        1 * helicopterRepository.saveAll({ it.size() == 3 })
    }

    def "should seed landing sites when empty"() {
        given:
        userRepository.count() >> 1L
        helicopterRepository.count() >> 1L
        crewMemberRepository.count() >> 1L
        crewMemberRepository.findByRole(CrewRole.PILOT) >> []
        landingSiteRepository.count() >> 0L
        flightOperationRepository.count() >> 1L
        passwordEncoder.encode(_) >> "hash"

        when:
        initializer.run()

        then:
        1 * landingSiteRepository.saveAll({ it.size() == 8 })
    }

    def "should skip all seeding when data exists"() {
        given:
        userRepository.count() >> 1L
        helicopterRepository.count() >> 1L
        crewMemberRepository.count() >> 1L
        crewMemberRepository.findByRole(CrewRole.PILOT) >> []
        landingSiteRepository.count() >> 1L
        flightOperationRepository.count() >> 1L

        when:
        initializer.run()

        then:
        0 * userRepository.saveAll(_)
        0 * helicopterRepository.saveAll(_)
        0 * crewMemberRepository.saveAll(_)
        0 * landingSiteRepository.saveAll(_)
        0 * flightOperationRepository.saveAll(_)
    }
}
