import { useEffect, useState } from 'react'
import axios from 'axios'

function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString()
}

function UserBookings({ userId, refreshToken }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/bookings/user/${userId}`)
        setBookings(response.data)
        setError('')
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load user bookings.')
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [userId, refreshToken])

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h2 className="h5 mb-3">My Bookings (User ID: {userId})</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <p className="mb-0">Loading bookings...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Resource ID</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Rejection Reason</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">No bookings found.</td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.resourceId}</td>
                      <td>{formatDateTime(booking.startTime)}</td>
                      <td>{formatDateTime(booking.endTime)}</td>
                      <td>{booking.purpose}</td>
                      <td>{booking.status}</td>
                      <td>{booking.rejectionReason || '-'}</td>
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

export default UserBookings