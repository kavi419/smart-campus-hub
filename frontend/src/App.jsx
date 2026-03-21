import { useState } from 'react'
import ResourceList from './components/ResourceList'
import BookingForm from './components/BookingForm'
import UserBookings from './components/UserBookings'
import AdminBookingLink from './components/AdminBookingLink'

function App() {
  const userId = 1001
  const [bookingRefreshToken, setBookingRefreshToken] = useState(0)

  const refreshBookings = () => {
    setBookingRefreshToken((prev) => prev + 1)
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Smart Campus Operations Hub</h1>

      <ResourceList />
      <BookingForm userId={userId} onBookingCreated={refreshBookings} />
      <UserBookings userId={userId} refreshToken={bookingRefreshToken} />
      <AdminBookingLink refreshToken={bookingRefreshToken} onStatusUpdated={refreshBookings} />
    </div>
  )
}

export default App
