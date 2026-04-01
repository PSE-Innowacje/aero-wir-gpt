package pl.pse.aero.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pl.pse.aero.domain.FlightOperation;
import pl.pse.aero.domain.OperationStatus;

import java.util.List;

public interface FlightOperationRepository extends MongoRepository<FlightOperation, String> {

    List<FlightOperation> findByStatus(OperationStatus status);
}
