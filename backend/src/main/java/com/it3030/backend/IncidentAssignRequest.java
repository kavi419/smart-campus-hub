package com.it3030.backend;

import jakarta.validation.constraints.NotNull;

public class IncidentAssignRequest {

    @NotNull(message = "Technician ID is required")
    private Long assignedTechnicianId;

    public Long getAssignedTechnicianId() {
        return assignedTechnicianId;
    }

    public void setAssignedTechnicianId(Long assignedTechnicianId) {
        this.assignedTechnicianId = assignedTechnicianId;
    }
}
