import { useEffect, useState } from 'react'
import axios from 'axios'

const initialFormState = {
  resourceId: '',
  location: '',
  category: '',
  description: '',
  priority: 'MEDIUM',
  image1: '',
  image2: '',
  image3: '',
}

function IncidentForm({ reporterUserId, onIncidentCreated }) {
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState(initialFormState)

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

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const attachments = [formData.image1, formData.image2, formData.image3]
        .map((value) => value.trim())
        .filter((value) => value.length > 0)

      const payload = {
        resourceId: Number(formData.resourceId),
        location: formData.location,
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
        reportedBy: reporterUserId,
        attachments,
      }

      const response = await axios.post('/api/incidents', payload, {
        headers: {
          'X-User-Id': String(reporterUserId),
          'X-User-Role': 'USER',
        },
      })

      setSuccess(`Incident #${response.data.id} submitted successfully.`)
      setFormData(initialFormState)
      onIncidentCreated?.(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to report incident.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">Report Incident</h2>
          <span className="badge text-bg-secondary">Reporter ID: {reporterUserId}</span>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="incident-resourceId" className="form-label">Resource</label>
              <select
                id="incident-resourceId"
                name="resourceId"
                className="form-select"
                value={formData.resourceId}
                onChange={handleChange}
                required
                disabled={loadingResources}
              >
                <option value="">Select a resource</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} ({resource.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label htmlFor="incident-location" className="form-label">Location</label>
              <input
                id="incident-location"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                placeholder="Block / Floor / Room"
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="incident-category" className="form-label">Category</label>
              <input
                id="incident-category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                placeholder="Electrical, Network, Plumbing..."
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="incident-priority" className="form-label">Priority</label>
              <select
                id="incident-priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

            <div className="col-12">
              <label htmlFor="incident-description" className="form-label">Description</label>
              <textarea
                id="incident-description"
                name="description"
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the problem in detail"
                required
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="incident-image1" className="form-label">Image URL 1</label>
              <input
                id="incident-image1"
                name="image1"
                className="form-control"
                value={formData.image1}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="incident-image2" className="form-label">Image URL 2</label>
              <input
                id="incident-image2"
                name="image2"
                className="form-control"
                value={formData.image2}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="incident-image3" className="form-label">Image URL 3</label>
              <input
                id="incident-image3"
                name="image3"
                className="form-control"
                value={formData.image3}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <button className="btn btn-primary mt-3" type="submit" disabled={submitting || loadingResources}>
            {submitting ? 'Submitting...' : 'Submit Incident'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default IncidentForm
