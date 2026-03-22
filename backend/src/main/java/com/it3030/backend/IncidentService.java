package com.it3030.backend;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class IncidentService {

    private static final int MAX_ATTACHMENTS = 3;

    private final IncidentRepository incidentRepository;
    private final CommentRepository commentRepository;

    public IncidentService(IncidentRepository incidentRepository,
                           CommentRepository commentRepository) {
        this.incidentRepository = incidentRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional
    public Incident createIncident(IncidentCreateRequest request) {
        validateAttachments(request.getAttachments());

        Incident incident = new Incident();
        incident.setResourceId(request.getResourceId());
        incident.setLocation(request.getLocation());
        incident.setCategory(request.getCategory());
        incident.setDescription(request.getDescription());
        incident.setPriority(request.getPriority());
        incident.setReportedBy(request.getReportedBy());
        incident.setStatus(Incident.IncidentStatus.OPEN);
        incident.setAttachments(new ArrayList<>(safeAttachments(request.getAttachments())));
        incident.setAssignedTechnicianId(null);
        incident.setRejectionReason(null);
        incident.setResolutionNotes(null);

        return incidentRepository.save(incident);
    }

    @Transactional(readOnly = true)
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Transactional
    public Incident assignTechnician(Long incidentId, Long technicianId) {
        Incident incident = getIncidentById(incidentId);

        if (incident.getStatus() == Incident.IncidentStatus.CLOSED
            || incident.getStatus() == Incident.IncidentStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot assign technician to a CLOSED or REJECTED incident.");
        }

        incident.setAssignedTechnicianId(technicianId);
        if (incident.getStatus() == Incident.IncidentStatus.OPEN) {
            incident.setStatus(Incident.IncidentStatus.IN_PROGRESS);
        }

        return incidentRepository.save(incident);
    }

    @Transactional
    public Incident updateStatus(Long incidentId, IncidentStatusUpdateRequest request) {
        Incident incident = getIncidentById(incidentId);

        if (request.getStatus() == Incident.IncidentStatus.REJECTED
            && (request.getRejectionReason() == null || request.getRejectionReason().isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required when status is REJECTED.");
        }

        if (request.getStatus() != Incident.IncidentStatus.REJECTED) {
            incident.setRejectionReason(null);
        } else {
            incident.setRejectionReason(request.getRejectionReason());
        }

        incident.setStatus(request.getStatus());

        if (request.getResolutionNotes() != null && !request.getResolutionNotes().isBlank()) {
            incident.setResolutionNotes(request.getResolutionNotes());
        }

        return incidentRepository.save(incident);
    }

    @Transactional
    public Comment addComment(Long incidentId, IncidentCommentCreateRequest request) {
        Incident incident = getIncidentById(incidentId);

        if (incident.getStatus() == Incident.IncidentStatus.CLOSED) {
            throw new IllegalArgumentException("Cannot add comments to a CLOSED incident.");
        }

        Comment comment = new Comment();
        comment.setIncident(incident);
        comment.setUserId(request.getUserId());
        comment.setMessage(request.getMessage());

        return commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public List<Comment> getCommentsByIncidentId(Long incidentId) {
        getIncidentById(incidentId);
        return commentRepository.findByIncident_IdOrderByCreatedAtAsc(incidentId);
    }

    @Transactional(readOnly = true)
    public Incident getIncidentById(Long id) {
        return incidentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Incident not found with id: " + id));
    }

    private void validateAttachments(List<String> attachments) {
        List<String> safeAttachments = safeAttachments(attachments);
        if (safeAttachments.size() > MAX_ATTACHMENTS) {
            throw new IllegalArgumentException("A maximum of 3 attachments is allowed.");
        }

        for (String attachment : safeAttachments) {
            if (attachment == null || attachment.isBlank()) {
                throw new IllegalArgumentException("Attachment path cannot be blank.");
            }
        }
    }

    private List<String> safeAttachments(List<String> attachments) {
        return attachments == null ? List.of() : attachments;
    }
}
