package pl.pse.aero.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pl.pse.aero.domain.*;
import pl.pse.aero.dto.KmlProcessingResult;
import pl.pse.aero.repository.FlightOperationRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class OperationService {

    private final FlightOperationRepository operationRepository;
    private final KmlService kmlService;

    public OperationService(FlightOperationRepository operationRepository, KmlService kmlService) {
        this.operationRepository = operationRepository;
        this.kmlService = kmlService;
    }

    public List<FlightOperation> findAll(OperationStatus statusFilter) {
        List<FlightOperation> ops;
        if (statusFilter != null) {
            ops = new ArrayList<>(operationRepository.findByStatus(statusFilter));
        } else {
            ops = new ArrayList<>(operationRepository.findAll());
        }
        ops.sort(Comparator.comparing(
                FlightOperation::getPlannedDateEarliest,
                Comparator.nullsLast(Comparator.naturalOrder())
        ));
        return ops;
    }

    public FlightOperation findById(String id) {
        return operationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Flight operation not found: " + id));
    }

    public FlightOperation create(FlightOperation operation, MultipartFile kmlFile, String currentUserEmail) {
        operation.setStatus(OperationStatus.SUBMITTED);
        operation.setCreatedByEmail(currentUserEmail);

        if (kmlFile != null && !kmlFile.isEmpty()) {
            KmlProcessingResult kmlResult = kmlService.saveAndParse(kmlFile);
            operation.setKmlFilePath(kmlResult.filePath());
            operation.setKmlPoints(kmlResult.points());
            operation.setRouteLengthKm(kmlResult.routeLengthKm());
        }

        if (operation.getActivityTypes() == null) {
            operation.setActivityTypes(new ArrayList<>());
        }
        if (operation.getContacts() == null) {
            operation.setContacts(new ArrayList<>());
        }
        if (operation.getComments() == null) {
            operation.setComments(new ArrayList<>());
        }
        if (operation.getChangeHistory() == null) {
            operation.setChangeHistory(new ArrayList<>());
        }

        operation.prePersist();
        return operationRepository.save(operation);
    }

    public FlightOperation update(String id, FlightOperation updates, UserRole currentUserRole) {
        FlightOperation existing = findById(id);

        if (currentUserRole == UserRole.PLANNER) {
            validatePlannerEdit(existing);
            applyPlannerFields(existing, updates);
        } else if (currentUserRole == UserRole.SUPERVISOR) {
            applySupervisorFields(existing, updates);
        } else {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Role " + currentUserRole + " cannot edit operations");
        }

        existing.prePersist();
        return operationRepository.save(existing);
    }

    public void addComment(String operationId, String content, String authorEmail) {
        FlightOperation op = findById(operationId);
        OperationComment comment = OperationComment.builder()
                .content(content)
                .authorEmail(authorEmail)
                .build();
        op.getComments().add(comment);
        operationRepository.save(op);
    }

    private void validatePlannerEdit(FlightOperation existing) {
        List<OperationStatus> editableStatuses = List.of(
                OperationStatus.SUBMITTED,
                OperationStatus.REJECTED,
                OperationStatus.CONFIRMED,
                OperationStatus.SCHEDULED,
                OperationStatus.PARTIALLY_COMPLETED
        );
        if (!editableStatuses.contains(existing.getStatus())) {
            throw new IllegalStateException(
                    "Planner cannot edit operation in status: " + existing.getStatus());
        }
    }

    private void applyPlannerFields(FlightOperation existing, FlightOperation updates) {
        // Planner can edit these fields
        existing.setOrderNumber(updates.getOrderNumber());
        existing.setShortDescription(updates.getShortDescription());
        existing.setProposedDateEarliest(updates.getProposedDateEarliest());
        existing.setProposedDateLatest(updates.getProposedDateLatest());
        existing.setAdditionalInfo(updates.getAdditionalInfo());
        existing.setActivityTypes(updates.getActivityTypes());
        existing.setContacts(updates.getContacts());
        // Planner CANNOT edit: plannedDates, status, postCompletionNotes, routeLengthKm, createdByEmail
    }

    private void applySupervisorFields(FlightOperation existing, FlightOperation updates) {
        // Supervisor can edit all fields
        existing.setOrderNumber(updates.getOrderNumber());
        existing.setShortDescription(updates.getShortDescription());
        existing.setProposedDateEarliest(updates.getProposedDateEarliest());
        existing.setProposedDateLatest(updates.getProposedDateLatest());
        existing.setAdditionalInfo(updates.getAdditionalInfo());
        existing.setActivityTypes(updates.getActivityTypes());
        existing.setContacts(updates.getContacts());
        existing.setPlannedDateEarliest(updates.getPlannedDateEarliest());
        existing.setPlannedDateLatest(updates.getPlannedDateLatest());
        existing.setPostCompletionNotes(updates.getPostCompletionNotes());
    }
}
