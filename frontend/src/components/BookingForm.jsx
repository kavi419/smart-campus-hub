import { useEffect, useState } from 'react'
import axios from 'axios'

const initialBookingState = {
  resourceId: '',
  startTime: '',
  endTime: '',
  purpose: '',
}

function BookingForm({ userId, onBookingCreated }) {
  const [resources, setResources] = useState([])
  const [formData, setFormData] = useState(initialBookingState)
  const [loadingResources, setLoadingResources] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoadingResources(true)
        const response = await axios.get('/api/resources')
        setResources(response.data)
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load resources.')
      } finally {
        setLoadingResources(false)
      }
    }

    loadResources()
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      const payload = {
        resourceId: Number(formData.resourceId),
        userId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        status: 'PENDING',
      }

      await axios.post('/api/bookings', payload)
      setSuccess('Booking request submitted successfully.')
      setFormData(initialBookingState)
      onBookingCreated?.()
    } catch (err) {
      const backendMessage = err.response?.data?.message
      setError(backendMessage || err.message || 'Failed to create booking.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h2 className="h5 mb-3">Create Booking</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="resourceId" className="form-label">Resource</label>
              <select
                id="resourceId"
                name="resourceId"
                className="form-select"
                value={formData.resourceId}
                onChange={handleInputChange}
                required
                disabled={loadingResources}
              >
                <option value="">Select a resource</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} ({resource.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label htmlFor="startTime" className="form-label">Start Time</label>
              <input
                id="startTime"
                name="startTime"
                type="datetime-local"
                className="form-control"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-md-3">
              <label htmlFor="endTime" className="form-label">End Time</label>
              <input
                id="endTime"
                name="endTime"
                type="datetime-local"
                className="form-control"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-12">
              <label htmlFor="purpose" className="form-label">Purpose</label>
              <input
                id="purpose"
                name="purpose"
                className="form-control"
                value={formData.purpose}
                onChange={handleInputChange}
                placeholder="Reason for this booking"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-3" disabled={submitting || loadingResources}>
            {submitting ? 'Submitting...' : 'Submit Booking'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookingForm