package pl.pse.aero.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pl.pse.aero.domain.*;
import pl.pse.aero.repository.CrewMemberRepository;
import pl.pse.aero.repository.HelicopterRepository;
import pl.pse.aero.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final HelicopterRepository helicopterRepository;
    private final CrewMemberRepository crewMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           HelicopterRepository helicopterRepository,
                           CrewMemberRepository crewMemberRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.helicopterRepository = helicopterRepository;
        this.crewMemberRepository = crewMemberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedHelicopters();
        seedCrewMembers();
    }

    private void seedUsers() {
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

    private void seedHelicopters() {
        if (helicopterRepository.count() > 0) {
            log.info("Helicopters already exist, skipping seed.");
            return;
        }

        List<Helicopter> helicopters = List.of(
                Helicopter.builder()
                        .registrationNumber("SP-HEA")
                        .type("Eurocopter EC135")
                        .description("Główny helikopter operacyjny")
                        .maxCrewCount(4)
                        .maxCrewWeightKg(450)
                        .status(HelicopterStatus.ACTIVE)
                        .inspectionExpiryDate(LocalDate.of(2026, 12, 31))
                        .rangeKm(635)
                        .build(),
                Helicopter.builder()
                        .registrationNumber("SP-HEB")
                        .type("Bell 407GXi")
                        .description("Helikopter zapasowy")
                        .maxCrewCount(3)
                        .maxCrewWeightKg(380)
                        .status(HelicopterStatus.ACTIVE)
                        .inspectionExpiryDate(LocalDate.of(2026, 9, 15))
                        .rangeKm(550)
                        .build(),
                Helicopter.builder()
                        .registrationNumber("SP-HEC")
                        .type("Robinson R44")
                        .description("W przeglądzie")
                        .maxCrewCount(2)
                        .maxCrewWeightKg(240)
                        .status(HelicopterStatus.INACTIVE)
                        .rangeKm(480)
                        .build()
        );

        helicopterRepository.saveAll(helicopters);
        log.info("Seeded {} helicopters.", helicopters.size());
    }

    private void seedCrewMembers() {
        if (crewMemberRepository.count() > 0) {
            log.info("Crew members already exist, skipping seed.");
            return;
        }

        List<CrewMember> members = List.of(
                CrewMember.builder()
                        .firstName("Jan")
                        .lastName("Kowalski")
                        .email("pilot@aero.pl")
                        .weightKg(82)
                        .role(CrewRole.PILOT)
                        .pilotLicenseNumber("PL-2024-001")
                        .licenseExpiryDate(LocalDate.of(2027, 3, 31))
                        .trainingExpiryDate(LocalDate.of(2026, 11, 30))
                        .build(),
                CrewMember.builder()
                        .firstName("Piotr")
                        .lastName("Nowak")
                        .email("piotr.nowak@aero.pl")
                        .weightKg(78)
                        .role(CrewRole.PILOT)
                        .pilotLicenseNumber("PL-2024-002")
                        .licenseExpiryDate(LocalDate.of(2027, 6, 30))
                        .trainingExpiryDate(LocalDate.of(2026, 10, 15))
                        .build(),
                CrewMember.builder()
                        .firstName("Anna")
                        .lastName("Wiśniewska")
                        .email("anna.wisniewska@aero.pl")
                        .weightKg(62)
                        .role(CrewRole.OBSERVER)
                        .trainingExpiryDate(LocalDate.of(2026, 12, 31))
                        .build(),
                CrewMember.builder()
                        .firstName("Marek")
                        .lastName("Zieliński")
                        .email("marek.zielinski@aero.pl")
                        .weightKg(90)
                        .role(CrewRole.OBSERVER)
                        .trainingExpiryDate(LocalDate.of(2026, 8, 15))
                        .build()
        );

        crewMemberRepository.saveAll(members);
        log.info("Seeded {} crew members.", members.size());
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
