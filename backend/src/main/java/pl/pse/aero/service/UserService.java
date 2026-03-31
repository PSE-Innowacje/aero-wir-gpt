package pl.pse.aero.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.pse.aero.domain.User;
import pl.pse.aero.dto.UserRequest;
import pl.pse.aero.repository.UserRepository;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
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

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .crewMemberId(request.getCrewMemberId())
                .build();

        return userRepository.save(user);
    }

    public User update(String id, UserRequest request) {
        User user = findById(id);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setCrewMemberId(request.getCrewMemberId());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return userRepository.save(user);
    }
}
