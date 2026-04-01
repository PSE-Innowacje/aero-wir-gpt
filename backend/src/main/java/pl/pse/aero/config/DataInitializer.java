package pl.pse.aero.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pl.pse.aero.domain.*;
import pl.pse.aero.dto.KmlProcessingResult;
import pl.pse.aero.repository.*;
import pl.pse.aero.service.KmlService;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final HelicopterRepository helicopterRepository;
    private final CrewMemberRepository crewMemberRepository;
    private final LandingSiteRepository landingSiteRepository;
    private final FlightOperationRepository flightOperationRepository;
    private final KmlService kmlService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           HelicopterRepository helicopterRepository,
                           CrewMemberRepository crewMemberRepository,
                           LandingSiteRepository landingSiteRepository,
                           FlightOperationRepository flightOperationRepository,
                           KmlService kmlService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.helicopterRepository = helicopterRepository;
        this.crewMemberRepository = crewMemberRepository;
        this.landingSiteRepository = landingSiteRepository;
        this.flightOperationRepository = flightOperationRepository;
        this.kmlService = kmlService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedHelicopters();
        List<CrewMember> pilots = seedCrewMembers();
        seedLandingSites();
        seedFlightOperations();
        linkPilotUser(pilots);
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

    private List<CrewMember> seedCrewMembers() {
        if (crewMemberRepository.count() > 0) {
            log.info("Crew members already exist, skipping seed.");
            return crewMemberRepository.findByRole(CrewRole.PILOT);
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

        List<CrewMember> saved = (List<CrewMember>) crewMemberRepository.saveAll(members);
        log.info("Seeded {} crew members.", saved.size());
        return saved.stream().filter(m -> m.getRole() == CrewRole.PILOT).toList();
    }

    private void seedLandingSites() {
        if (landingSiteRepository.count() > 0) {
            log.info("Landing sites already exist, skipping seed.");
            return;
        }

        List<LandingSite> sites = List.of(
                LandingSite.builder()
                        .name("Lotnisko Babice (EPBC)")
                        .latitude(52.268)
                        .longitude(20.911)
                        .build(),
                LandingSite.builder()
                        .name("Lotnisko Modlin (EPMO)")
                        .latitude(52.451)
                        .longitude(20.651)
                        .build(),
                LandingSite.builder()
                        .name("Lotnisko Radom (EPRA)")
                        .latitude(51.389)
                        .longitude(21.213)
                        .build(),
                LandingSite.builder()
                        .name("Lotnisko Wrocław (EPWR)")
                        .latitude(51.103)
                        .longitude(16.886)
                        .build(),
                LandingSite.builder()
                        .name("Lotnisko Gdańsk (EPGD)")
                        .latitude(54.378)
                        .longitude(18.466)
                        .build(),
                LandingSite.builder()
                        .name("Lotnisko Kraków-Balice (EPKK)")
                        .latitude(50.078)
                        .longitude(19.785)
                        .build(),
                LandingSite.builder()
                        .name("Lotnisko Katowice-Pyrzowice (EPKT)")
                        .latitude(50.474)
                        .longitude(19.080)
                        .build(),
                LandingSite.builder()
                        .name("Lotnisko Poznań-Ławica (EPPO)")
                        .latitude(52.421)
                        .longitude(16.826)
                        .build()
        );

        landingSiteRepository.saveAll(sites);
        log.info("Seeded {} landing sites.", sites.size());
    }

    private void seedFlightOperations() {
        if (flightOperationRepository.count() > 0) {
            log.info("Flight operations already exist, skipping seed.");
            return;
        }

        List<FlightOperation> operations = new ArrayList<>();

        operations.add(createOperation(
                "DE-25-12020", "Inspekcja linii 400kV Warszawa-Północ",
                "test-data/route-warsaw-short.kml",
                List.of(ActivityType.VISUAL_INSPECTION, ActivityType.PHOTOS),
                OperationStatus.SUBMITTED,
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 9, 30),
                null, null
        ));

        operations.add(createOperation(
                "CJI-3203", "Skan 3D linii 220kV Kraków-Wschód",
                "test-data/route-south-medium.kml",
                List.of(ActivityType.SCAN_3D, ActivityType.FAULT_LOCATION),
                OperationStatus.CONFIRMED,
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 8, 31),
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 31)
        ));

        operations.add(createOperation(
                "DE-25-13001", "Patrolowanie trasy Łódź-Rzeszów",
                "test-data/route-cross-long.kml",
                List.of(ActivityType.PATROL),
                OperationStatus.CONFIRMED,
                LocalDate.of(2026, 4, 15), LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 6, 15), LocalDate.of(2026, 9, 15)
        ));

        operations.add(FlightOperation.builder()
                .orderNumber("CJI-3210")
                .shortDescription("Oględziny linii 110kV — odrzucone")
                .status(OperationStatus.REJECTED)
                .activityTypes(List.of(ActivityType.VISUAL_INSPECTION))
                .contacts(List.of("jan@pse.pl"))
                .createdByEmail("planista@aero.pl")
                .proposedDateEarliest(LocalDate.of(2026, 3, 1))
                .proposedDateLatest(LocalDate.of(2026, 4, 30))
                .comments(new ArrayList<>())
                .changeHistory(new ArrayList<>())
                .build());
        operations.get(3).prePersist();

        flightOperationRepository.saveAll(operations);
        log.info("Seeded {} flight operations.", operations.size());
    }

    private FlightOperation createOperation(String orderNumber, String description,
                                            String kmlResourcePath, List<ActivityType> activityTypes,
                                            OperationStatus status,
                                            LocalDate proposedEarliest, LocalDate proposedLatest,
                                            LocalDate plannedEarliest, LocalDate plannedLatest) {
        FlightOperation op = FlightOperation.builder()
                .orderNumber(orderNumber)
                .shortDescription(description)
                .activityTypes(activityTypes)
                .contacts(List.of("planista@aero.pl"))
                .status(status)
                .createdByEmail("planista@aero.pl")
                .proposedDateEarliest(proposedEarliest)
                .proposedDateLatest(proposedLatest)
                .plannedDateEarliest(plannedEarliest)
                .plannedDateLatest(plannedLatest)
                .comments(new ArrayList<>())
                .changeHistory(new ArrayList<>())
                .build();

        try {
            ClassPathResource resource = new ClassPathResource(kmlResourcePath);
            byte[] content = resource.getInputStream().readAllBytes();
            KmlProcessingResult kmlResult = kmlService.parseAndValidate(content, resource.getFilename());
            op.setKmlFileContent(kmlResult.fileContent());
            op.setKmlFileName(kmlResult.fileName());
            op.setKmlPoints(kmlResult.points());
            op.setRouteLengthKm(kmlResult.routeLengthKm());
        } catch (IOException e) {
            log.warn("Could not load KML test data from {}: {}", kmlResourcePath, e.getMessage());
        }

        op.prePersist();
        return op;
    }

    private void linkPilotUser(List<CrewMember> pilots) {
        if (pilots.isEmpty()) return;
        userRepository.findByEmail("pilot@aero.pl").ifPresent(user -> {
            if (user.getCrewMemberId() == null) {
                CrewMember pilotCrew = pilots.stream()
                        .filter(p -> "pilot@aero.pl".equals(p.getEmail()))
                        .findFirst()
                        .orElse(pilots.get(0));
                user.setCrewMemberId(pilotCrew.getId());
                userRepository.save(user);
                log.info("Linked pilot@aero.pl to crew member: {}", pilotCrew.getId());
            }
        });
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
