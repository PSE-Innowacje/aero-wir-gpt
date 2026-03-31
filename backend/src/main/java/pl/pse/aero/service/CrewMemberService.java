package pl.pse.aero.service;

import org.springframework.stereotype.Service;
import pl.pse.aero.domain.CrewMember;
import pl.pse.aero.domain.CrewRole;
import pl.pse.aero.dto.CrewMemberRequest;
import pl.pse.aero.repository.CrewMemberRepository;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CrewMemberService {

    private final CrewMemberRepository crewMemberRepository;

    public CrewMemberService(CrewMemberRepository crewMemberRepository) {
        this.crewMemberRepository = crewMemberRepository;
    }

    public List<CrewMember> findAll() {
        List<CrewMember> all = new java.util.ArrayList<>(crewMemberRepository.findAll());
        all.sort(Comparator.comparing(CrewMember::getEmail));
        return all;
    }

    public CrewMember findById(String id) {
        return crewMemberRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Crew member not found: " + id));
    }

    public CrewMember create(CrewMemberRequest request) {
        validatePilotFields(request);
        CrewMember member = mapToEntity(new CrewMember(), request);
        return crewMemberRepository.save(member);
    }

    public CrewMember update(String id, CrewMemberRequest request) {
        validatePilotFields(request);
        CrewMember member = findById(id);
        mapToEntity(member, request);
        return crewMemberRepository.save(member);
    }

    private void validatePilotFields(CrewMemberRequest request) {
        if (request.getRole() == CrewRole.PILOT) {
            if (request.getPilotLicenseNumber() == null || request.getPilotLicenseNumber().isBlank()) {
                throw new IllegalArgumentException("Pilot must have a license number");
            }
            if (request.getLicenseExpiryDate() == null) {
                throw new IllegalArgumentException("Pilot must have a license expiry date");
            }
        }
    }

    private CrewMember mapToEntity(CrewMember member, CrewMemberRequest request) {
        member.setFirstName(request.getFirstName());
        member.setLastName(request.getLastName());
        member.setEmail(request.getEmail());
        member.setWeightKg(request.getWeightKg());
        member.setRole(request.getRole());
        member.setPilotLicenseNumber(request.getPilotLicenseNumber());
        member.setLicenseExpiryDate(request.getLicenseExpiryDate());
        member.setTrainingExpiryDate(request.getTrainingExpiryDate());
        return member;
    }
}
