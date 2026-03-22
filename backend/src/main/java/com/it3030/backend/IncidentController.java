package com.it3030.backend;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Incident> createIncident(@Valid @RequestBody IncidentCreateRequest request,
                                                   Authentication authentication) {
        request.setReportedBy(parseAuthenticatedUserId(authentication));
        Incident created = incidentService.createIncident(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Incident>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<Incident>> getMyIncidents(Authentication authentication) {
        Long currentUserId = parseAuthenticatedUserId(authentication);
        return ResponseEntity.ok(incidentService.getIncidentsByReportedUserId(currentUserId));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Incident> assignTechnician(@PathVariable Long id,
                                                     @Valid @RequestBody IncidentAssignRequest request) {
        Incident updated = incidentService.assignTechnician(id, request.getAssignedTechnicianId());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Incident> updateStatus(@PathVariable Long id,
                                                 @Valid @RequestBody IncidentStatusUpdateRequest request) {
        Incident updated = incidentService.updateStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getCommentsByIncidentId(id));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Comment> addComment(@PathVariable Long id,
                                              @Valid @RequestBody IncidentCommentCreateRequest request,
                                              Authentication authentication) {
        request.setUserId(parseAuthenticatedUserId(authentication));
        Comment comment = incidentService.addComment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    private Long parseAuthenticatedUserId(Authentication authentication) {
        if (authentication == null) {
            throw new IllegalArgumentException("Authenticated user is required.");
        }

        if (authentication.getPrincipal() instanceof OAuth2User oAuth2User) {
            Object appUserId = oAuth2User.getAttribute("appUserId");
            if (appUserId != null) {
                try {
                    return Long.valueOf(appUserId.toString());
                } catch (NumberFormatException ex) {
                    throw new IllegalArgumentException("Invalid authenticated user id.");
                }
            }
        }

        if (authentication.getName() == null) {
            throw new IllegalArgumentException("Authenticated user is required.");
        }

        try {
            return Long.valueOf(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid authenticated user id.");
        }
    }
}
