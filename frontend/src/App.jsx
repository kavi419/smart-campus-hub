import { useEffect, useState } from 'react'
import axios from 'axios'
import ResourceList from './components/ResourceList'
import BookingForm from './components/BookingForm'
import UserBookings from './components/UserBookings'
import AdminBookingLink from './components/AdminBookingLink'
import IncidentForm from './components/IncidentForm'
import IncidentList from './components/IncidentList'
import IncidentDetail from './components/IncidentDetail'
import NotificationPanel from './components/NotificationPanel'
import './App.css'

function App() {
  const apiOrigin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080'

  const [authLoading, setAuthLoading] = useState(true)
  const [authUser, setAuthUser] = useState(null)
  const [bookingRefreshToken, setBookingRefreshToken] = useState(0)
  const [incidentRefreshToken, setIncidentRefreshToken] = useState(0)
  const [selectedIncident, setSelectedIncident] = useState(null)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await axios.get('/api/auth/me')
        setAuthUser(response.data)
      } catch {
        setAuthUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    loadSession()
  }, [])

  const refreshBookings = () => {
    setBookingRefreshToken((prev) => prev + 1)
  }

  const refreshIncidents = () => {
    setIncidentRefreshToken((prev) => prev + 1)
  }

  const handleGoogleLogin = () => {
    window.location.href = `${apiOrigin}/oauth2/authorization/google`
  }

  const handleLogout = async () => {
    await axios.post('/api/auth/logout')
    setAuthUser(null)
    setSelectedIncident(null)
  }

  if (authLoading) {
    return <div className="container py-5">Checking session...</div>
  }

  if (!authUser) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm mx-auto auth-card">
          <div className="card-body p-4">
            <h1 className="h4 mb-3">Smart Campus Operations Hub</h1>
            <p className="text-muted mb-4">Login to access campus resources, bookings, incidents, and notifications.</p>
            <button type="button" className="btn btn-primary" onClick={handleGoogleLogin}>
              Login with Google
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isAdmin = authUser.role === 'ADMIN'

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Smart Campus Operations Hub</h1>
        <div className="d-flex align-items-center gap-2">
          <span className="badge text-bg-dark">{authUser.role}</span>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <NotificationPanel userId={authUser.id} role={authUser.role} />

      <ResourceList canManage={isAdmin} />
      <BookingForm userId={authUser.id} onBookingCreated={refreshBookings} />
      <UserBookings userId={authUser.id} refreshToken={bookingRefreshToken} />
      {isAdmin && <AdminBookingLink refreshToken={bookingRefreshToken} onStatusUpdated={refreshBookings} />}

      <hr className="my-5" />
      <div className="mb-4">
        <h2 className="h4 mb-1">Module C: Maintenance & Incident Ticketing</h2>
        <p className="text-muted mb-0">Report issues, track status, and collaborate with comments.</p>
      </div>

      <IncidentForm reporterUserId={authUser.id} onIncidentCreated={refreshIncidents} />
      {isAdmin && (
        <IncidentList
          refreshToken={incidentRefreshToken}
          selectedIncidentId={selectedIncident?.id || null}
          onSelectIncident={setSelectedIncident}
        />
      )}

      <IncidentDetail
        incident={selectedIncident}
        currentUser={authUser}
        canUpdateIncident={isAdmin}
        onIncidentUpdated={refreshIncidents}
      />
    </div>
  )
}

export default App
