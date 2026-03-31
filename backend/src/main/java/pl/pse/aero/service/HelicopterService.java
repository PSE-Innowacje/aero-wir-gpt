package pl.pse.aero.service;

import org.springframework.stereotype.Service;
import pl.pse.aero.domain.Helicopter;
import pl.pse.aero.domain.HelicopterStatus;
import pl.pse.aero.dto.HelicopterRequest;
import pl.pse.aero.repository.HelicopterRepository;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class HelicopterService {

    private final HelicopterRepository helicopterRepository;

    public HelicopterService(HelicopterRepository helicopterRepository) {
        this.helicopterRepository = helicopterRepository;
    }

    public List<Helicopter> findAll() {
        List<Helicopter> all = new java.util.ArrayList<>(helicopterRepository.findAll());
        all.sort(Comparator.comparing(Helicopter::getStatus)
                .thenComparing(Helicopter::getRegistrationNumber));
        return all;
    }

    public Helicopter findById(String id) {
        return helicopterRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Helicopter not found: " + id));
    }

    public Helicopter create(HelicopterRequest request) {
        validateInspectionDate(request);
        Helicopter helicopter = mapToEntity(new Helicopter(), request);
        return helicopterRepository.save(helicopter);
    }

    public Helicopter update(String id, HelicopterRequest request) {
        validateInspectionDate(request);
        Helicopter helicopter = findById(id);
        mapToEntity(helicopter, request);
        return helicopterRepository.save(helicopter);
    }

    private void validateInspectionDate(HelicopterRequest request) {
        if (request.getStatus() == HelicopterStatus.ACTIVE && request.getInspectionExpiryDate() == null) {
            throw new IllegalArgumentException("Active helicopters must have an inspection expiry date");
        }
    }

    private Helicopter mapToEntity(Helicopter helicopter, HelicopterRequest request) {
        helicopter.setRegistrationNumber(request.getRegistrationNumber());
        helicopter.setType(request.getType());
        helicopter.setDescription(request.getDescription());
        helicopter.setMaxCrewCount(request.getMaxCrewCount());
        helicopter.setMaxCrewWeightKg(request.getMaxCrewWeightKg());
        helicopter.setStatus(request.getStatus());
        helicopter.setInspectionExpiryDate(request.getInspectionExpiryDate());
        helicopter.setRangeKm(request.getRangeKm());
        return helicopter;
    }
}
