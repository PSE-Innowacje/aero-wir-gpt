package pl.pse.aero.repository;

import org.springframework.data.couchbase.repository.CouchbaseRepository;
import pl.pse.aero.domain.FlightOperation;
import pl.pse.aero.domain.OperationStatus;

import java.util.Collection;
import java.util.List;

public interface FlightOperationRepository extends CouchbaseRepository<FlightOperation, String> {

    List<FlightOperation> findByStatus(OperationStatus status);

    List<FlightOperation> findByStatusIn(Collection<OperationStatus> statuses);
}
