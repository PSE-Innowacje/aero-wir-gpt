package pl.pse.aero.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import pl.pse.aero.domain.CrewMember;
import pl.pse.aero.domain.CrewRole;

import java.util.List;

public interface CrewMemberRepository extends MongoRepository<CrewMember, String> {

    List<CrewMember> findByRole(CrewRole role);
}
