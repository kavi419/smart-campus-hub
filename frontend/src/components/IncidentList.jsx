import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const statusClassMap = {
  OPEN: 'text-bg-danger',
  IN_PROGRESS: 'text-bg-warning',
  RESOLVED: 'text-bg-success',
  CLOSED: 'text-bg-secondary',
  REJECTED: 'text-bg-dark',
}

function formatDate(value) {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString()
}

function IncidentList({ refreshToken, selectedIncidentId, onSelectIncident }) {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/incidents')
        setIncidents(response.data)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load incidents.')
      } finally {
        setLoading(false)
      }
    }

    loadIncidents()
  }, [refreshToken])

  const selectedIncident = useMemo(
    () => incidents.find((incident) => incident.id === selectedIncidentId) || null,
    [incidents, selectedIncidentId],
  )

  useEffect(() => {
    if (selectedIncident) {
      onSelectIncident?.(selectedIncident)
    }
  }, [selectedIncident, onSelectIncident])

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">Incident Dashboard</h2>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <p className="mb-0">Loading incidents...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Technician</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">No incidents found.</td>
                  </tr>
                ) : (
                  incidents.map((incident) => (
                    <tr key={incident.id} className={selectedIncidentId === incident.id ? 'table-primary' : ''}>
                      <td>{incident.id}</td>
                      <td>{incident.category}</td>
                      <td>{incident.location}</td>
                      <td>{incident.priority}</td>
                      <td>
                        <span className={`badge ${statusClassMap[incident.status] || 'text-bg-secondary'}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td>{incident.assignedTechnicianId || '-'}</td>
                      <td>{formatDate(incident.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onSelectIncident?.(incident)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedIncident && (
          <div className="alert alert-light border mt-3 mb-0">
            Selected Incident #{selectedIncident.id}: {selectedIncident.category} at {selectedIncident.location}
          </div>
        )}
      </div>
    </div>
  )
}

export default IncidentList
