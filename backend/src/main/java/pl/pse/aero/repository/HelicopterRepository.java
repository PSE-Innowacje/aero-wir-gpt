package pl.pse.aero.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pl.pse.aero.domain.Helicopter;

public interface HelicopterRepository extends MongoRepository<Helicopter, String> {
}
