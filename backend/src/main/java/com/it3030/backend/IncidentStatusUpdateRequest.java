package com.it3030.backend;

import jakarta.validation.constraints.NotNull;

public class IncidentStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private Incident.IncidentStatus status;

    private String rejectionReason;

    private String resolutionNotes;

    public Incident.IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(Incident.IncidentStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
