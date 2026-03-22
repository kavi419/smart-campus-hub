import { useState } from 'react'
import axios from 'axios'

function TechnicianView({ incident, technicianUserId, onUpdated }) {
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!incident) {
    return null
  }

  const handleResolve = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await axios.put(
        `/api/incidents/${incident.id}/status`,
        {
          status: 'RESOLVED',
          resolutionNotes,
        },
        {
          headers: {
            'X-User-Id': String(technicianUserId),
            'X-User-Role': 'TECHNICIAN',
          },
        },
      )

      setSuccess('Incident marked as RESOLVED.')
      setResolutionNotes('')
      onUpdated?.()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update incident status.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h6 mb-0">Technician Panel</h3>
          <span className="badge text-bg-warning">Technician ID: {technicianUserId}</span>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        <form onSubmit={handleResolve}>
          <div className="mb-3">
            <label htmlFor="resolutionNotes" className="form-label">Resolution Notes</label>
            <textarea
              id="resolutionNotes"
              className="form-control"
              rows="3"
              value={resolutionNotes}
              onChange={(event) => setResolutionNotes(event.target.value)}
              placeholder="Write what was fixed and what was tested"
              required
            />
          </div>

          <button type="submit" className="btn btn-success" disabled={submitting}>
            {submitting ? 'Updating...' : 'Mark as RESOLVED'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TechnicianView
