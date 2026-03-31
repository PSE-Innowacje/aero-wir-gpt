package pl.pse.aero.repository;

import org.springframework.data.couchbase.repository.CouchbaseRepository;
import pl.pse.aero.domain.CrewMember;
import pl.pse.aero.domain.CrewRole;

import java.util.List;

public interface CrewMemberRepository extends CouchbaseRepository<CrewMember, String> {

    List<CrewMember> findByRole(CrewRole role);
}
