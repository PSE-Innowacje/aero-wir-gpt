package pl.pse.aero.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import pl.pse.aero.domain.UserRole;
import pl.pse.aero.repository.UserRepository;

@Component
public class AuthenticationHelper {

    private final UserRepository userRepository;

    public AuthenticationHelper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserRole resolveRole(Authentication authentication) {
        if (authentication == null) return null;
        return userRepository.findByEmail(authentication.getName())
                .map(u -> u.getRole())
                .orElse(null);
    }
}
