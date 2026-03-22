package com.it3030.backend;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class IncidentService {

    private static final int MAX_ATTACHMENTS = 3;

    private final IncidentRepository incidentRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    public IncidentService(IncidentRepository incidentRepository,
                           CommentRepository commentRepository,
                           NotificationService notificationService) {
        this.incidentRepository = incidentRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
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
        Incident.IncidentStatus previousStatus = incident.getStatus();

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

        Incident updated = incidentRepository.save(incident);

        if (previousStatus != updated.getStatus()) {
            notifyIncidentStakeholders(
                updated,
                "Incident #" + updated.getId() + " status updated to " + updated.getStatus() + "."
            );
        }

        return updated;
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

        Comment savedComment = commentRepository.save(comment);

        notifyIncidentStakeholders(
            incident,
            "New comment added to Incident #" + incident.getId() + " by User #" + savedComment.getUserId() + ".",
            savedComment.getUserId()
        );

        return savedComment;
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

    private void notifyIncidentStakeholders(Incident incident, String message, Long... excludedUserIds) {
        Set<Long> recipients = new HashSet<>();
        recipients.add(incident.getReportedBy());

        if (incident.getAssignedTechnicianId() != null) {
            recipients.add(incident.getAssignedTechnicianId());
        }

        if (excludedUserIds != null) {
            for (Long excludedUserId : excludedUserIds) {
                recipients.remove(excludedUserId);
            }
        }

        for (Long recipient : recipients) {
            notificationService.createNotification(
                recipient,
                message,
                Notification.NotificationType.INCIDENT
            );
        }
    }
}
