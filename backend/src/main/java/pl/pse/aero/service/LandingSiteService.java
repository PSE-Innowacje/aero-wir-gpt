package pl.pse.aero.service;

import org.springframework.stereotype.Service;
import pl.pse.aero.domain.LandingSite;
import pl.pse.aero.dto.LandingSiteRequest;
import pl.pse.aero.repository.LandingSiteRepository;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class LandingSiteService {

    private final LandingSiteRepository landingSiteRepository;

    public LandingSiteService(LandingSiteRepository landingSiteRepository) {
        this.landingSiteRepository = landingSiteRepository;
    }

    public List<LandingSite> findAll() {
        List<LandingSite> all = new java.util.ArrayList<>(landingSiteRepository.findAll());
        all.sort(Comparator.comparing(LandingSite::getName));
        return all;
    }

    public LandingSite findById(String id) {
        return landingSiteRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Landing site not found: " + id));
    }

    public LandingSite create(LandingSiteRequest request) {
        LandingSite landingSite = mapToEntity(new LandingSite(), request);
        return landingSiteRepository.save(landingSite);
    }

    public LandingSite update(String id, LandingSiteRequest request) {
        LandingSite landingSite = findById(id);
        mapToEntity(landingSite, request);
        return landingSiteRepository.save(landingSite);
    }

    private LandingSite mapToEntity(LandingSite landingSite, LandingSiteRequest request) {
        landingSite.setName(request.getName());
        landingSite.setLatitude(request.getLatitude());
        landingSite.setLongitude(request.getLongitude());
        return landingSite;
    }
}
