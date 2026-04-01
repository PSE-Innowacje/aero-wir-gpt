package pl.pse.aero.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pl.pse.aero.domain.FlightOrder;
import pl.pse.aero.domain.OrderStatus;

import java.util.List;

public interface FlightOrderRepository extends MongoRepository<FlightOrder, String> {

    List<FlightOrder> findByStatus(OrderStatus status);
}
