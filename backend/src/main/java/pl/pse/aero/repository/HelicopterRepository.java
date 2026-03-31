package pl.pse.aero.repository;

import org.springframework.data.couchbase.repository.CouchbaseRepository;
import pl.pse.aero.domain.Helicopter;

public interface HelicopterRepository extends CouchbaseRepository<Helicopter, String> {
}
