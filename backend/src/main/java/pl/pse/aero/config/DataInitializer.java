package pl.pse.aero.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pl.pse.aero.domain.User;
import pl.pse.aero.domain.UserRole;
import pl.pse.aero.repository.UserRepository;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Users already exist, skipping seed.");
            return;
        }

        List<User> users = List.of(
                createUser("Admin", "Admin", "admin@aero.pl", "admin", UserRole.ADMIN),
                createUser("Planista", "Planista", "planista@aero.pl", "planista", UserRole.PLANNER),
                createUser("Nadzor", "Nadzor", "nadzor@aero.pl", "nadzor", UserRole.SUPERVISOR),
                createUser("Pilot", "Pilot", "pilot@aero.pl", "pilot", UserRole.PILOT)
        );

        userRepository.saveAll(users);
        log.info("Seeded {} default users.", users.size());
    }

    private User createUser(String firstName, String lastName, String email,
                            String rawPassword, UserRole role) {
        return User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
    }
}
