import { useEffect, useState } from 'react'
import axios from 'axios'
import { CircleCheck, Clock, FolderOpen, XCircle } from 'lucide-react'

function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString()
}

const StatusBadge = ({ status }) => {
  let colorClass = 'bg-secondary'
  let Icon = FolderOpen
  let text = status

  switch (status) {
    case 'APPROVED':
      colorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      Icon = CircleCheck
      break
    case 'PENDING':
      colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      Icon = Clock
      break
    case 'REJECTED':
      colorClass = 'bg-red-500/20 text-red-300 border-red-500/30'
      Icon = XCircle
      break
    case 'CANCELLED':
        colorClass = 'bg-gray-500/20 text-gray-300 border-gray-500/30'
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
    <div className="h-100">
      <div className="d-flex justify-content-between align-items-center mb-4 pt-2">
        <h2 className="h5 mb-0 text-white">My Bookings</h2>
        <span className="text-white-50 small">ID: {userId}</span>
      </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <p className="mb-0 text-white-50">Loading bookings...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent', '--bs-table-bg': 'transparent' }}>
              <thead>
                <tr>
                  <th className="text-white-50 fw-normal border-secondary">Resource</th>
                  <th className="text-white-50 fw-normal border-secondary">Time</th>
                  <th className="text-white-50 fw-normal border-secondary">Status</th>
                  <th className="text-white-50 fw-normal border-secondary">Reason</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">No bookings found.</td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="text-white">{booking.resourceId}</td>
                      <td className="text-white-50 small">
                        <div>{new Date(booking.startTime).toLocaleDateString()}</div>
                        <div>{new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td><StatusBadge status={booking.status} /></td>
                      <td className="text-white-50 small">{booking.rejectionReason || '-'}</td>
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

export default UserBookings