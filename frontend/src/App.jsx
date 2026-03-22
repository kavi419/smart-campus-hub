import { useState } from 'react'
import ResourceList from './components/ResourceList'
import BookingForm from './components/BookingForm'
import UserBookings from './components/UserBookings'
import AdminBookingLink from './components/AdminBookingLink'
import IncidentForm from './components/IncidentForm'
import IncidentList from './components/IncidentList'
import IncidentDetail from './components/IncidentDetail'
import './App.css'

function App() {
  const userId = 1001
  const incidentReporterId = 1101
  const incidentAdminId = 9001
  const technicianId = 7001

  const [bookingRefreshToken, setBookingRefreshToken] = useState(0)
  const [incidentRefreshToken, setIncidentRefreshToken] = useState(0)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [commentActorRole, setCommentActorRole] = useState('USER')

  const refreshBookings = () => {
    setBookingRefreshToken((prev) => prev + 1)
  }

  const refreshIncidents = () => {
    setIncidentRefreshToken((prev) => prev + 1)
  }

  const getCommentActor = () => {
    if (commentActorRole === 'TECHNICIAN') {
      return { id: technicianId, role: 'TECHNICIAN' }
    }
    if (commentActorRole === 'ADMIN') {
      return { id: incidentAdminId, role: 'ADMIN' }
    }
    return { id: incidentReporterId, role: 'USER' }
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Smart Campus Operations Hub</h1>

      <ResourceList />
      <BookingForm userId={userId} onBookingCreated={refreshBookings} />
      <UserBookings userId={userId} refreshToken={bookingRefreshToken} />
      <AdminBookingLink refreshToken={bookingRefreshToken} onStatusUpdated={refreshBookings} />

      <hr className="my-5" />
      <div className="mb-4">
        <h2 className="h4 mb-1">Module C: Maintenance & Incident Ticketing</h2>
        <p className="text-muted mb-0">Report issues, track status, and collaborate with comments.</p>
      </div>

      <IncidentForm reporterUserId={incidentReporterId} onIncidentCreated={refreshIncidents} />
      <IncidentList
        adminUserId={incidentAdminId}
        refreshToken={incidentRefreshToken}
        selectedIncidentId={selectedIncident?.id || null}
        onSelectIncident={setSelectedIncident}
      />

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <label htmlFor="commentActorRole" className="form-label mb-1">Comment as</label>
          <select
            id="commentActorRole"
            className="form-select comment-role-select"
            value={commentActorRole}
            onChange={(event) => setCommentActorRole(event.target.value)}
          >
            <option value="USER">USER</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      <IncidentDetail
        incident={selectedIncident}
        commentActor={getCommentActor()}
        technicianUserId={technicianId}
        onIncidentUpdated={refreshIncidents}
      />
    </div>
  )
}

export default App
