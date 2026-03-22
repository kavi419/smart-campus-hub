import { useEffect, useState } from 'react'
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

function MyIncidents({ refreshToken, selectedIncidentId, onSelectIncident }) {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadMyIncidents = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/incidents/my')
        setIncidents(response.data)
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load your incidents.')
      } finally {
        setLoading(false)
      }
    }

    loadMyIncidents()
  }, [refreshToken])

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h2 className="h5 mb-3">My Reported Incidents</h2>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <p className="mb-0">Loading your incidents...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">You have not reported incidents yet.</td>
                  </tr>
                ) : (
                  incidents.map((incident) => (
                    <tr key={incident.id} className={selectedIncidentId === incident.id ? 'table-primary' : ''}>
                      <td>{incident.id}</td>
                      <td>{incident.category}</td>
                      <td>
                        <span className={`badge ${statusClassMap[incident.status] || 'text-bg-secondary'}`}>
                          {incident.status}
                        </span>
                      </td>
                      <td>{formatDate(incident.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onSelectIncident?.(incident)}
                        >
                          View Details
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
    </div>
  )
}

export default MyIncidents
