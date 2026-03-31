package pl.pse.aero.repository;

import org.springframework.data.couchbase.repository.CouchbaseRepository;
import pl.pse.aero.domain.User;

import java.util.Optional;

public interface UserRepository extends CouchbaseRepository<User, String> {

    Optional<User> findByEmail(String email);
}
