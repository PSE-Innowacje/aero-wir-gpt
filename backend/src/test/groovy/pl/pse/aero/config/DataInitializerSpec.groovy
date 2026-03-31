package pl.pse.aero.config

import org.springframework.security.crypto.password.PasswordEncoder
import pl.pse.aero.domain.User
import pl.pse.aero.domain.UserRole
import pl.pse.aero.repository.UserRepository
import spock.lang.Specification

class DataInitializerSpec extends Specification {

    UserRepository userRepository = Mock()
    PasswordEncoder passwordEncoder = Mock()
    DataInitializer initializer = new DataInitializer(userRepository, passwordEncoder)

    def "should seed 4 users when repository is empty"() {
        given:
        userRepository.count() >> 0L
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

    def "should hash passwords using PasswordEncoder"() {
        given:
        userRepository.count() >> 0L
        passwordEncoder.encode(_) >> { String raw -> "bcrypt(" + raw + ")" }

        when:
        initializer.run()

        then:
        1 * userRepository.saveAll({ List<User> users ->
            users.every { it.passwordHash.startsWith("bcrypt(") }
        })
    }

    def "should skip seeding when users already exist"() {
        given:
        userRepository.count() >> 4L

        when:
        initializer.run()

        then:
        0 * userRepository.saveAll(_)
    }

    def "should create users with correct email-to-role mapping"() {
        given:
        userRepository.count() >> 0L
        passwordEncoder.encode(_) >> "hash"
        List<User> saved = null

        when:
        initializer.run()

        then:
        1 * userRepository.saveAll(_) >> { args -> saved = args[0] }

        and:
        saved.find { it.email == "admin@aero.pl" }.role == UserRole.ADMIN
        saved.find { it.email == "planista@aero.pl" }.role == UserRole.PLANNER
        saved.find { it.email == "nadzor@aero.pl" }.role == UserRole.SUPERVISOR
        saved.find { it.email == "pilot@aero.pl" }.role == UserRole.PILOT
    }
}
