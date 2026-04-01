package pl.pse.aero.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pl.pse.aero.domain.LandingSite;

public interface LandingSiteRepository extends MongoRepository<LandingSite, String> {
}
