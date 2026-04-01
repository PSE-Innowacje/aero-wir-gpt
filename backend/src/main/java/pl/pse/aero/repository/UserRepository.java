package pl.pse.aero.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pl.pse.aero.domain.User;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);
}
