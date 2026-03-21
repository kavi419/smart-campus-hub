import { useEffect, useState } from 'react'
import axios from 'axios'

function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString()
}

function AdminBookingLink({ refreshToken, onStatusUpdated }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [rejectionReasons, setRejectionReasons] = useState({})

  useEffect(() => {
    const loadAllBookings = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/bookings')
        setBookings(response.data)
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load all bookings.')
      } finally {
        setLoading(false)
      }
    }

    loadAllBookings()
  }, [refreshToken])

  const handleReasonChange = (bookingId, value) => {
    setRejectionReasons((prev) => ({
      ...prev,
      [bookingId]: value,
    }))
  }

  const updateStatus = async (bookingId, status) => {
    try {
      const payload = {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReasons[bookingId] || '' : '',
      }

      const response = await axios.put(`/api/bookings/${bookingId}/status`, payload)
      setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? response.data : booking)))
      setStatusMessage(`Booking ${bookingId} updated to ${status}.`)
      setError('')
      onStatusUpdated?.()
    } catch (err) {
      setStatusMessage('')
      setError(err.response?.data?.message || err.message || 'Failed to update booking status.')
    }
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h2 className="h5 mb-3">Admin Booking Panel</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {statusMessage && <div className="alert alert-success">{statusMessage}</div>}

        {loading ? (
          <p className="mb-0">Loading admin bookings...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Resource</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Rejection Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">No bookings found.</td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.userId}</td>
                      <td>{booking.resourceId}</td>
                      <td>{formatDateTime(booking.startTime)}</td>
                      <td>{formatDateTime(booking.endTime)}</td>
                      <td>{booking.purpose}</td>
                      <td>{booking.status}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Reason (for reject)"
                          value={rejectionReasons[booking.id] || ''}
                          onChange={(event) => handleReasonChange(booking.id, event.target.value)}
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => updateStatus(booking.id, 'APPROVED')}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => updateStatus(booking.id, 'REJECTED')}
                          >
                            Reject
                          </button>
                        </div>
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

export default AdminBookingLink