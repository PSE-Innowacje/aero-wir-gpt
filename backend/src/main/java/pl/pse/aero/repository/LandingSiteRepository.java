package pl.pse.aero.repository;

import org.springframework.data.couchbase.repository.CouchbaseRepository;
import pl.pse.aero.domain.LandingSite;

public interface LandingSiteRepository extends CouchbaseRepository<LandingSite, String> {
}
