package pl.pse.aero.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.pse.aero.domain.CrewMember;
import pl.pse.aero.domain.CrewRole;
import pl.pse.aero.domain.User;
import pl.pse.aero.domain.UserRole;
import pl.pse.aero.dto.UserRequest;
import pl.pse.aero.repository.CrewMemberRepository;
import pl.pse.aero.repository.UserRepository;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CrewMemberRepository crewMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       CrewMemberRepository crewMemberRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.crewMemberRepository = crewMemberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findAll() {
        List<User> all = new java.util.ArrayList<>(userRepository.findAll());
        all.sort(Comparator.comparing(User::getEmail));
        return all;
    }

    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + id));
    }

    public User create(UserRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required when creating a user");
        }

        // Auto-create a CrewMember if none linked
        String crewMemberId = request.getCrewMemberId();
        if (crewMemberId == null || crewMemberId.isBlank()) {
            CrewMember crew = createCrewMemberForUser(request);
            crewMemberId = crew.getId();
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .crewMemberId(crewMemberId)
                .build();

        return userRepository.save(user);
    }

    public User update(String id, UserRequest request) {
        User user = findById(id);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        // If crew member link is cleared, auto-create one
        if (request.getCrewMemberId() == null || request.getCrewMemberId().isBlank()) {
            if (user.getCrewMemberId() == null || user.getCrewMemberId().isBlank()) {
                CrewMember crew = createCrewMemberForUser(request);
                user.setCrewMemberId(crew.getId());
            }
        } else {
            user.setCrewMemberId(request.getCrewMemberId());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return userRepository.save(user);
    }

    private CrewMember createCrewMemberForUser(UserRequest request) {
        CrewRole crewRole = (request.getRole() == UserRole.PILOT) ? CrewRole.PILOT : CrewRole.OBSERVER;

        CrewMember crew = CrewMember.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .weightKg(80) // default weight
                .role(crewRole)
                .trainingExpiryDate(LocalDate.now().plusYears(1))
                .build();

        if (crewRole == CrewRole.PILOT) {
            crew.setPilotLicenseNumber("AUTO-" + System.currentTimeMillis());
            crew.setLicenseExpiryDate(LocalDate.now().plusYears(1));
        }

        return crewMemberRepository.save(crew);
    }
}
