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
        seedCrewMembers();
        seedLandingSites();
        seedFlightOperations();
        linkAllUsersToCrewMembers();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            log.info("Users already exist, skipping seed.");
            return;
        }

        List<User> users = List.of(
                createUser("Super", "User", "super@aero.pl", "super", UserRole.SUPERUSER),
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
                Helicopter.builder().registrationNumber("SP-HEA").type("Eurocopter EC135").description("Główny helikopter operacyjny").maxCrewCount(4).maxCrewWeightKg(450).status(HelicopterStatus.ACTIVE).inspectionExpiryDate(LocalDate.of(2026, 12, 31)).rangeKm(635).build(),
                Helicopter.builder().registrationNumber("SP-HEB").type("Bell 407GXi").description("Helikopter zapasowy").maxCrewCount(3).maxCrewWeightKg(380).status(HelicopterStatus.ACTIVE).inspectionExpiryDate(LocalDate.of(2026, 9, 15)).rangeKm(550).build(),
                Helicopter.builder().registrationNumber("SP-HEC").type("Robinson R44").description("W przeglądzie").maxCrewCount(2).maxCrewWeightKg(240).status(HelicopterStatus.INACTIVE).rangeKm(480).build(),
                Helicopter.builder().registrationNumber("SP-AER").type("Airbus H160").description("Najnowszy nabytek floty").maxCrewCount(5).maxCrewWeightKg(520).status(HelicopterStatus.ACTIVE).inspectionExpiryDate(LocalDate.of(2027, 3, 15)).rangeKm(780).build(),
                Helicopter.builder().registrationNumber("SP-HLP").type("Bell 429").description("Helikopter szybkiego reagowania").maxCrewCount(4).maxCrewWeightKg(400).status(HelicopterStatus.ACTIVE).inspectionExpiryDate(LocalDate.of(2026, 11, 30)).rangeKm(660).build(),
                Helicopter.builder().registrationNumber("SP-LPR").type("Eurocopter EC145").description("Helikopter medyczny — współdzielony").maxCrewCount(3).maxCrewWeightKg(350).status(HelicopterStatus.ACTIVE).inspectionExpiryDate(LocalDate.of(2026, 7, 20)).rangeKm(500).build(),
                Helicopter.builder().registrationNumber("SP-TAC").type("AgustaWestland AW139").description("Helikopter taktyczny").maxCrewCount(6).maxCrewWeightKg(600).status(HelicopterStatus.ACTIVE).inspectionExpiryDate(LocalDate.of(2027, 1, 10)).rangeKm(750).build(),
                Helicopter.builder().registrationNumber("SP-NXB").type("MD 902 Explorer").description("Przegląd silnika — wyłączony z eksploatacji").maxCrewCount(3).maxCrewWeightKg(340).status(HelicopterStatus.INACTIVE).rangeKm(430).build()
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
                // --- Pilots (6) ---
                crew("Jan", "Kowalski", "pilot@aero.pl", 82, CrewRole.PILOT, "PL-2024-001", LocalDate.of(2027, 3, 31), LocalDate.of(2026, 11, 30)),
                crew("Piotr", "Nowak", "piotr.nowak@aero.pl", 78, CrewRole.PILOT, "PL-2024-002", LocalDate.of(2027, 6, 30), LocalDate.of(2026, 10, 15)),
                crew("Tomasz", "Wójcik", "tomasz.wojcik@aero.pl", 75, CrewRole.PILOT, "PL-2023-003", LocalDate.of(2025, 12, 31), LocalDate.of(2025, 6, 30)), // expired
                crew("Robert", "Kamiński", "robert.kaminski@aero.pl", 85, CrewRole.PILOT, "PL-2024-004", LocalDate.of(2027, 9, 30), LocalDate.of(2027, 3, 15)),
                crew("Łukasz", "Szymański", "lukasz.szymanski@aero.pl", 79, CrewRole.PILOT, "PL-2024-005", LocalDate.of(2027, 12, 31), LocalDate.of(2027, 6, 30)),
                crew("Adam", "Woźniak", "adam.wozniak@aero.pl", 91, CrewRole.PILOT, "PL-2024-006", LocalDate.of(2026, 8, 15), LocalDate.of(2026, 5, 1)), // license expiring soon
                // --- Observers (10) ---
                crewObs("Anna", "Wiśniewska", "anna.wisniewska@aero.pl", 62, LocalDate.of(2026, 12, 31)),
                crewObs("Marek", "Zieliński", "marek.zielinski@aero.pl", 90, LocalDate.of(2026, 8, 15)),
                crewObs("Katarzyna", "Dąbrowska", "katarzyna.dabrowska@aero.pl", 58, LocalDate.of(2025, 3, 15)), // expired training
                crewObs("Michał", "Lewandowski", "michal.lewandowski@aero.pl", 88, LocalDate.of(2026, 5, 1)),
                crewObs("Ewa", "Kaczmarek", "ewa.kaczmarek@aero.pl", 65, LocalDate.of(2027, 4, 30)),
                crewObs("Paweł", "Jankowski", "pawel.jankowski@aero.pl", 95, LocalDate.of(2027, 2, 28)),
                crewObs("Zofia", "Mazur", "zofia.mazur@aero.pl", 55, LocalDate.of(2027, 7, 15)),
                crewObs("Krzysztof", "Krawczyk", "krzysztof.krawczyk@aero.pl", 100, LocalDate.of(2026, 9, 30)),
                crewObs("Agnieszka", "Wróbel", "agnieszka.wrobel@aero.pl", 60, LocalDate.of(2027, 1, 31)),
                crewObs("Jakub", "Sikora", "jakub.sikora@aero.pl", 72, LocalDate.of(2026, 11, 15)),
                // --- Heavy crew for weight validation ---
                crewObs("Benek", "Gruby", "benek.gruby@aero.pl", 200, LocalDate.of(2027, 12, 31)),
                crewObs("Benissimo", "Gruby", "benissimo.gruby@aero.pl", 200, LocalDate.of(2027, 12, 31)),
                crewObs("Ben", "Gruby", "ben.gruby@aero.pl", 200, LocalDate.of(2027, 12, 31)),
                crewObs("Benoit", "Gruby", "benoit.gruby@aero.pl", 200, LocalDate.of(2027, 12, 31)),
                crewObs("Benten", "Gruby", "benten.gruby@aero.pl", 200, LocalDate.of(2027, 12, 31))
        );

        crewMemberRepository.saveAll(members);
        log.info("Seeded {} crew members.", members.size());
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

        // --- SUBMITTED (5) ---
        operations.add(createOperation("DE-25-12020", "Inspekcja linii 400kV Warszawa-Północ", "test-data/route-warsaw-short.kml",
                List.of(ActivityType.VISUAL_INSPECTION, ActivityType.PHOTOS), OperationStatus.SUBMITTED,
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 9, 30), null, null));
        operations.add(createOperation("DE-25-14001", "Oględziny linii 220kV Poznań-Zachód", "test-data/route-warsaw-short.kml",
                List.of(ActivityType.VISUAL_INSPECTION), OperationStatus.SUBMITTED,
                LocalDate.of(2026, 6, 15), LocalDate.of(2026, 10, 31), null, null));
        operations.add(createOperation("CJI-4010", "Skan 3D stacji Płock", "test-data/route-warsaw-short.kml",
                List.of(ActivityType.SCAN_3D), OperationStatus.SUBMITTED,
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 8, 31), null, null));
        operations.add(createOperation("DE-25-14005", "Zdjęcia dokumentacyjne linia 110kV Siedlce", "test-data/route-warsaw-short.kml",
                List.of(ActivityType.PHOTOS, ActivityType.VISUAL_INSPECTION), OperationStatus.SUBMITTED,
                LocalDate.of(2026, 5, 15), LocalDate.of(2026, 7, 15), null, null));
        operations.add(createOperation("CJI-4020", "Lokalizacja awarii linia 400kV Elbląg", "test-data/route-south-medium.kml",
                List.of(ActivityType.FAULT_LOCATION), OperationStatus.SUBMITTED,
                LocalDate.of(2026, 4, 1), LocalDate.of(2026, 6, 30), null, null));

        // --- CONFIRMED (6) — available for flight orders ---
        operations.add(createOperation("CJI-3203", "Skan 3D linii 220kV Kraków-Wschód", "test-data/route-south-medium.kml",
                List.of(ActivityType.SCAN_3D, ActivityType.FAULT_LOCATION), OperationStatus.CONFIRMED,
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 8, 31), LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 31)));
        operations.add(createOperation("DE-25-13001", "Patrolowanie trasy Łódź-Rzeszów", "test-data/route-cross-long.kml",
                List.of(ActivityType.PATROL), OperationStatus.CONFIRMED,
                LocalDate.of(2026, 4, 15), LocalDate.of(2026, 10, 15), LocalDate.of(2026, 6, 15), LocalDate.of(2026, 9, 15)));
        operations.add(createOperation("DE-25-13010", "Inspekcja linii 400kV Gdańsk-Tczew", "test-data/route-warsaw-short.kml",
                List.of(ActivityType.VISUAL_INSPECTION, ActivityType.PHOTOS), OperationStatus.CONFIRMED,
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 9, 30), LocalDate.of(2026, 7, 15), LocalDate.of(2026, 8, 15)));
        operations.add(createOperation("CJI-3250", "Patrolowanie linii 110kV Katowice-Bielsko", "test-data/route-south-medium.kml",
                List.of(ActivityType.PATROL, ActivityType.PHOTOS), OperationStatus.CONFIRMED,
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 11, 30), LocalDate.of(2026, 8, 1), LocalDate.of(2026, 10, 31)));
        operations.add(createOperation("DE-25-13020", "Skan 3D stacji Radom", "test-data/route-cross-long.kml",
                List.of(ActivityType.SCAN_3D), OperationStatus.CONFIRMED,
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 12, 31), LocalDate.of(2026, 9, 1), LocalDate.of(2026, 11, 30)));
        operations.add(createOperation("CJI-3260", "Lokalizacja awarii linia 220kV Wrocław", "test-data/route-south-medium.kml",
                List.of(ActivityType.FAULT_LOCATION, ActivityType.VISUAL_INSPECTION), OperationStatus.CONFIRMED,
                LocalDate.of(2026, 5, 15), LocalDate.of(2026, 8, 15), LocalDate.of(2026, 6, 1), LocalDate.of(2026, 7, 31)));

        // --- REJECTED (3) ---
        operations.add(simpleOperation("CJI-3210", "Oględziny linii 110kV — odrzucone", OperationStatus.REJECTED,
                List.of(ActivityType.VISUAL_INSPECTION), LocalDate.of(2026, 3, 1), LocalDate.of(2026, 4, 30)));
        operations.add(simpleOperation("DE-25-12050", "Zdjęcia linii 400kV — brak budżetu", OperationStatus.REJECTED,
                List.of(ActivityType.PHOTOS), LocalDate.of(2026, 2, 1), LocalDate.of(2026, 3, 31)));
        operations.add(simpleOperation("CJI-3215", "Skan 3D — duplikat zgłoszenia", OperationStatus.REJECTED,
                List.of(ActivityType.SCAN_3D), LocalDate.of(2026, 4, 1), LocalDate.of(2026, 5, 31)));

        // --- CANCELLED (2) ---
        operations.add(simpleOperation("DE-25-11090", "Patrolowanie linii 110kV Olsztyn — rezygnacja", OperationStatus.CANCELLED,
                List.of(ActivityType.PATROL), LocalDate.of(2026, 1, 15), LocalDate.of(2026, 3, 15)));
        operations.add(simpleOperation("CJI-3100", "Oględziny stacji Lublin — anulowane", OperationStatus.CANCELLED,
                List.of(ActivityType.VISUAL_INSPECTION), LocalDate.of(2026, 2, 1), LocalDate.of(2026, 4, 30)));

        // --- COMPLETED (2) ---
        operations.add(simpleOperation("DE-25-10001", "Inspekcja linii 220kV Warszawa-Radom — zakończona", OperationStatus.COMPLETED,
                List.of(ActivityType.VISUAL_INSPECTION, ActivityType.PHOTOS), LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 31)));
        operations.add(simpleOperation("CJI-2900", "Patrolowanie trasy Kraków-Rzeszów — zakończona", OperationStatus.COMPLETED,
                List.of(ActivityType.PATROL), LocalDate.of(2025, 10, 1), LocalDate.of(2026, 1, 31)));

        // --- PARTIALLY_COMPLETED (2) ---
        operations.add(simpleOperation("DE-25-11050", "Skan 3D linii 400kV Bydgoszcz — częściowo zrealizowana", OperationStatus.PARTIALLY_COMPLETED,
                List.of(ActivityType.SCAN_3D, ActivityType.FAULT_LOCATION), LocalDate.of(2026, 1, 1), LocalDate.of(2026, 6, 30)));
        operations.add(simpleOperation("CJI-3150", "Zdjęcia linii 110kV Szczecin — częściowo", OperationStatus.PARTIALLY_COMPLETED,
                List.of(ActivityType.PHOTOS), LocalDate.of(2026, 2, 15), LocalDate.of(2026, 5, 31)));

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

    private void linkAllUsersToCrewMembers() {
        List<User> users = (List<User>) userRepository.findAll();
        List<CrewMember> allCrew = (List<CrewMember>) crewMemberRepository.findAll();

        for (User user : users) {
            if (user.getCrewMemberId() != null) continue;

            // Find crew member by matching email
            CrewMember match = allCrew.stream()
                    .filter(c -> c.getEmail().equals(user.getEmail()))
                    .findFirst()
                    .orElse(null);

            if (match == null) {
                // Auto-create crew member for this user
                CrewRole crewRole = (user.getRole() == UserRole.PILOT) ? CrewRole.PILOT : CrewRole.OBSERVER;
                match = CrewMember.builder()
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .weightKg(80)
                        .role(crewRole)
                        .trainingExpiryDate(LocalDate.of(2027, 12, 31))
                        .build();
                if (crewRole == CrewRole.PILOT) {
                    match.setPilotLicenseNumber("AUTO-" + user.getEmail().hashCode());
                    match.setLicenseExpiryDate(LocalDate.of(2027, 12, 31));
                }
                match = crewMemberRepository.save(match);
                log.info("Created crew member for user {}: {}", user.getEmail(), match.getId());
            }

            user.setCrewMemberId(match.getId());
            userRepository.save(user);
            log.info("Linked user {} to crew member {}", user.getEmail(), match.getId());
        }
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

    private FlightOperation simpleOperation(String orderNumber, String description, OperationStatus status,
                                              List<ActivityType> activityTypes,
                                              LocalDate proposedEarliest, LocalDate proposedLatest) {
        FlightOperation op = FlightOperation.builder()
                .orderNumber(orderNumber).shortDescription(description).status(status)
                .activityTypes(activityTypes).contacts(List.of("planista@aero.pl"))
                .createdByEmail("planista@aero.pl")
                .proposedDateEarliest(proposedEarliest).proposedDateLatest(proposedLatest)
                .comments(new ArrayList<>()).changeHistory(new ArrayList<>())
                .build();
        op.prePersist();
        return op;
    }

    private static CrewMember crew(String fn, String ln, String email, int wt,
                                   CrewRole role, String license, LocalDate licExp, LocalDate trainExp) {
        return CrewMember.builder().firstName(fn).lastName(ln).email(email).weightKg(wt)
                .role(role).pilotLicenseNumber(license).licenseExpiryDate(licExp).trainingExpiryDate(trainExp).build();
    }

    private static CrewMember crewObs(String fn, String ln, String email, int wt, LocalDate trainExp) {
        return CrewMember.builder().firstName(fn).lastName(ln).email(email).weightKg(wt)
                .role(CrewRole.OBSERVER).trainingExpiryDate(trainExp).build();
    }
}
