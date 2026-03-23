import { useEffect, useState } from 'react'
import axios from 'axios'
import MainLayout from './components/MainLayout'
import ResourceList from './components/ResourceList'
import BookingForm from './components/BookingForm'
import UserBookings from './components/UserBookings'
import AdminBookingLink from './components/AdminBookingLink'
import IncidentForm from './components/IncidentForm'
import IncidentList from './components/IncidentList'
import MyIncidents from './components/MyIncidents'
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
        const response = await axios.get('/api/auth/me', {
          validateStatus: (status) => status < 500 // Treat 401/403 as valid responses, not errors
        })
        if (response.status === 200) {
          setAuthUser(response.data)
        } else {
          setAuthUser(null)
        }
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
    return <div className="container py-5 text-white">Checking session...</div>
  }

  if (!authUser) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="glass-card p-5 text-center" style={{ maxWidth: '400px', width: '100%' }}>
            <h1 className="h3 mb-3 text-white">Smart Campus Hub</h1>
            <p className="text-secondary mb-4">Login to access campus resources, bookings, incidents, and notifications.</p>
            <button type="button" className="btn btn-primary w-100" onClick={handleGoogleLogin}>
              Login with Google
            </button>
        </div>
      </div>
    )
  }

  const isAdmin = authUser.role === 'ADMIN'
  const isUser = authUser.role === 'USER'

  return (
    <MainLayout authUser={authUser} onLogout={handleLogout}>
      <div className="dashboard-grid">
        
        {/* Notifications Section */}
        <div className="mb-4">
           {/* Passing styles via className or wrapping not handled by component yet, standard render */}
           <NotificationPanel userId={authUser.id} role={authUser.role} />
        </div>

        {/* Action Cards Grid */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
             <div className="glass-card h-100">
                <BookingForm userId={authUser.id} onBookingCreated={refreshBookings} />
             </div>
          </div>
          
          <div className="col-md-6">
             {/* Incidents are complex, might need refactoring later to fit glassmorphism better */}
             <div className="glass-card h-100">
                 {selectedIncident ? (
                   <div>
                     <button className="btn btn-sm btn-outline-light mb-3" onClick={() => setSelectedIncident(null)}>← Back to List</button>
                     <IncidentDetail incident={selectedIncident} currentUserId={authUser.id} isAdmin={isAdmin} onBack={() => setSelectedIncident(null)} onUpdate={refreshIncidents} />
                   </div>
                 ) : (
                   <IncidentList 
                      currentUserId={authUser.id} 
                      isAdmin={isAdmin} 
                      refreshToken={incidentRefreshToken}
                      onSelectIncident={setSelectedIncident} 
                   />
                 )}
             </div>
          </div>
        </div>

        {/* Lists Grid */}
        <div className="row g-4">
           <div className="col-12">
              <div className="glass-card">
                 <h3 className="h5 mb-3 text-white">Campus Resources</h3>
                 <ResourceList canManage={isAdmin} />
              </div>
           </div>
           
           <div className="col-12">
               <div className="glass-card">
                 <UserBookings userId={authUser.id} refreshToken={bookingRefreshToken} />
               </div>
           </div>

           {isAdmin && (
             <div className="col-12">
                <div className="glass-card">
                   <h3 className="h5 mb-3 text-white">Admin Booking Management</h3>
                   <AdminBookingLink refreshToken={bookingRefreshToken} onStatusUpdated={refreshBookings} />
                </div>
             </div>
           )}
        </div>
      </div>
    </MainLayout>
  )
}

export default App
