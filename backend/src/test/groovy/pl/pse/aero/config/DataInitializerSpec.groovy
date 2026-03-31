package pl.pse.aero.config

import org.springframework.security.crypto.password.PasswordEncoder
import pl.pse.aero.domain.*
import pl.pse.aero.repository.CrewMemberRepository
import pl.pse.aero.repository.HelicopterRepository
import pl.pse.aero.repository.UserRepository
import spock.lang.Specification

class DataInitializerSpec extends Specification {

    UserRepository userRepository = Mock()
    HelicopterRepository helicopterRepository = Mock()
    CrewMemberRepository crewMemberRepository = Mock()
    PasswordEncoder passwordEncoder = Mock()
    DataInitializer initializer = new DataInitializer(
            userRepository, helicopterRepository, crewMemberRepository, passwordEncoder)

    def "should seed 4 users when repository is empty"() {
        given:
        userRepository.count() >> 0L
        helicopterRepository.count() >> 1L
        crewMemberRepository.count() >> 1L
        passwordEncoder.encode(_) >> { String raw -> "hashed_" + raw }

        when:
        initializer.run()

        then:
        1 * userRepository.saveAll({ List<User> users ->
            users.size() == 4 &&
            users*.email.containsAll(["admin@aero.pl", "planista@aero.pl", "nadzor@aero.pl", "pilot@aero.pl"]) &&
            users*.role.containsAll([UserRole.ADMIN, UserRole.PLANNER, UserRole.SUPERVISOR, UserRole.PILOT])
        })
    }

    def "should seed 3 helicopters when repository is empty"() {
        given:
        userRepository.count() >> 1L
        helicopterRepository.count() >> 0L
        crewMemberRepository.count() >> 1L
        passwordEncoder.encode(_) >> "hash"

        when:
        initializer.run()

        then:
        1 * helicopterRepository.saveAll({ List<Helicopter> helis ->
            helis.size() == 3 &&
            helis*.registrationNumber.containsAll(["SP-HEA", "SP-HEB", "SP-HEC"]) &&
            helis.count { it.status == HelicopterStatus.ACTIVE } == 2 &&
            helis.count { it.status == HelicopterStatus.INACTIVE } == 1
        })
    }

    def "should seed 4 crew members when repository is empty"() {
        given:
        userRepository.count() >> 1L
        helicopterRepository.count() >> 1L
        crewMemberRepository.count() >> 0L
        passwordEncoder.encode(_) >> "hash"

        when:
        initializer.run()

        then:
        1 * crewMemberRepository.saveAll({ List<CrewMember> members ->
            members.size() == 4 &&
            members.count { it.role == CrewRole.PILOT } == 2 &&
            members.count { it.role == CrewRole.OBSERVER } == 2
        })
    }

    def "should skip all seeding when data already exists"() {
        given:
        userRepository.count() >> 4L
        helicopterRepository.count() >> 3L
        crewMemberRepository.count() >> 4L

        when:
        initializer.run()

        then:
        0 * userRepository.saveAll(_)
        0 * helicopterRepository.saveAll(_)
        0 * crewMemberRepository.saveAll(_)
    }
}
