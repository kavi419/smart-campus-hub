import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import TechnicianView from './TechnicianView'

function formatDate(value) {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString()
}

function IncidentDetail({
  incident,
  commentActor,
  technicianUserId,
  onIncidentUpdated,
}) {
  const [comments, setComments] = useState([])
  const [commentMessage, setCommentMessage] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [error, setError] = useState('')

  const attachments = useMemo(() => {
    if (!incident?.attachments) {
      return []
    }
    return incident.attachments.filter((item) => item && item.trim().length > 0)
  }, [incident])

  const loadComments = useCallback(async () => {
    if (!incident?.id) {
      return
    }

    try {
      setLoadingComments(true)
      setError('')
      const response = await axios.get(`/api/incidents/${incident.id}/comments`, {
        headers: {
          'X-User-Id': String(commentActor.id),
          'X-User-Role': commentActor.role,
        },
      })
      setComments(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load comments.')
    } finally {
      setLoadingComments(false)
    }
  }, [incident?.id, commentActor.id, commentActor.role])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleAddComment = async (event) => {
    event.preventDefault()
    if (!incident?.id) {
      return
    }

    try {
      setCommentSubmitting(true)
      setError('')
      await axios.post(
        `/api/incidents/${incident.id}/comments`,
        {
          userId: Number(commentActor.id),
          message: commentMessage,
        },
        {
          headers: {
            'X-User-Id': String(commentActor.id),
            'X-User-Role': commentActor.role,
          },
        },
      )
      setCommentMessage('')
      await loadComments()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add comment.')
    } finally {
      setCommentSubmitting(false)
    }
  }

  if (!incident) {
    return (
      <div className="card shadow-sm mb-4">
        <div className="card-body text-muted">Select an incident from the dashboard to view details.</div>
      </div>
    )
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2 className="h5 mb-1">Incident #{incident.id}</h2>
            <div className="text-muted">{incident.category} • {incident.location}</div>
          </div>
          <span className="badge text-bg-primary">Status: {incident.status}</span>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="small text-muted">Priority</div>
            <div>{incident.priority}</div>
          </div>
          <div className="col-md-6">
            <div className="small text-muted">Resource ID</div>
            <div>{incident.resourceId}</div>
          </div>
          <div className="col-md-6">
            <div className="small text-muted">Reported By</div>
            <div>{incident.reportedBy}</div>
          </div>
          <div className="col-md-6">
            <div className="small text-muted">Assigned Technician</div>
            <div>{incident.assignedTechnicianId || '-'}</div>
          </div>
          <div className="col-md-6">
            <div className="small text-muted">Created</div>
            <div>{formatDate(incident.createdAt)}</div>
          </div>
          <div className="col-md-6">
            <div className="small text-muted">Updated</div>
            <div>{formatDate(incident.updatedAt)}</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="small text-muted">Description</div>
          <p className="mb-0">{incident.description}</p>
        </div>

        {incident.resolutionNotes && (
          <div className="alert alert-success py-2">
            <strong>Resolution Notes:</strong> {incident.resolutionNotes}
          </div>
        )}

        {incident.rejectionReason && (
          <div className="alert alert-danger py-2">
            <strong>Rejection Reason:</strong> {incident.rejectionReason}
          </div>
        )}

        <div className="mb-4">
          <h3 className="h6">Attached Images</h3>
          {attachments.length === 0 ? (
            <p className="text-muted mb-0">No images attached.</p>
          ) : (
            <div className="row g-3">
              {attachments.map((imageUrl, index) => (
                <div className="col-md-4" key={imageUrl + index}>
                  <img
                    src={imageUrl}
                    alt={`Incident attachment ${index + 1}`}
                    className="img-fluid rounded border incident-image"
                    onError={(event) => {
                      event.target.style.display = 'none'
                    }}
                  />
                  <div className="small text-muted text-break mt-1">{imageUrl}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card border-0 bg-body-tertiary mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h6 mb-0">Comment Section</h3>
              <span className="badge text-bg-secondary">
                Actor: {commentActor.role} #{commentActor.id}
              </span>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            {loadingComments ? (
              <p className="mb-0">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-muted mb-0">No comments yet.</p>
            ) : (
              <ul className="list-group mb-3">
                {comments.map((comment) => (
                  <li key={comment.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>User #{comment.userId}</strong>
                      <span className="small text-muted">{formatDate(comment.createdAt)}</span>
                    </div>
                    <div>{comment.message}</div>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleAddComment}>
              <div className="input-group">
                <input
                  className="form-control"
                  value={commentMessage}
                  onChange={(event) => setCommentMessage(event.target.value)}
                  placeholder="Write a comment"
                  required
                />
                <button className="btn btn-outline-primary" type="submit" disabled={commentSubmitting}>
                  {commentSubmitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <TechnicianView incident={incident} technicianUserId={technicianUserId} onUpdated={onIncidentUpdated} />
      </div>
    </div>
  )
}

export default IncidentDetail
