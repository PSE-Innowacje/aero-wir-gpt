package pl.pse.aero.repository;

import org.springframework.data.couchbase.repository.CouchbaseRepository;
import pl.pse.aero.domain.FlightOrder;
import pl.pse.aero.domain.OrderStatus;

import java.util.List;

public interface FlightOrderRepository extends CouchbaseRepository<FlightOrder, String> {

    List<FlightOrder> findByStatus(OrderStatus status);
}
