import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { FolderOpen, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

function formatDate(value) {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleDateString() + ' ' + new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
}

const StatusBadge = ({ status }) => {
  let colorClass = 'bg-secondary'
  let Icon = AlertTriangle // Default icon
  let text = status

  switch (status) {
    case 'OPEN':
      colorClass = 'bg-sky-500/20 text-sky-300 border-sky-500/30'
      Icon = FolderOpen
      break
    case 'IN_PROGRESS':
      colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      Icon = Clock
      break
    case 'RESOLVED':
      colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      Icon = CheckCircle
      break
    case 'CLOSED':
      colorClass = 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      Icon = CheckCircle
      break
    case 'REJECTED':
      colorClass = 'bg-red-500/20 text-red-300 border-red-500/30'
      Icon = XCircle
      break
    default:
      break
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      <Icon size={14} />
      {text}
    </span>
  )
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
    <div className="h-100">
      <div className="d-flex justify-content-between align-items-center mb-4 pt-2">
        <h2 className="h5 mb-0 text-white">Incident Dashboard</h2>
      </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <p className="mb-0 text-white-50">Loading incidents...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover table-sm align-middle mb-0" style={{ background: 'transparent', '--bs-table-bg': 'transparent' }}>
              <thead>
                <tr>
                  <th className="text-white-50 fw-normal border-secondary">ID</th>
                  <th className="text-white-50 fw-normal border-secondary">Category</th>
                  <th className="text-white-50 fw-normal border-secondary">Location</th>
                  <th className="text-white-50 fw-normal border-secondary">Priority</th>
                  <th className="text-white-50 fw-normal border-secondary">Status</th>
                  <th className="text-white-50 fw-normal border-secondary">Technician</th>
                  <th className="text-white-50 fw-normal border-secondary">Created</th>
                  <th className="text-white-50 fw-normal border-secondary">Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">No incidents found.</td>
                  </tr>
                ) : (
                  incidents.map((incident) => (
                    <tr key={incident.id} className={selectedIncidentId === incident.id ? 'table-active' : ''}>
                      <td className="text-white">{incident.id}</td>
                      <td className="text-white">{incident.category}</td>
                      <td className="text-white">{incident.location}</td>
                      <td className="text-white">{incident.priority}</td>
                      <td>
                        <StatusBadge status={incident.status} />
                      </td>
                      <td className="text-white-50 small">{incident.assignedTechnicianId || '-'}</td>
                      <td className="text-white-50 small">{formatDate(incident.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light"
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
    </div>
  )
}

export default IncidentList
