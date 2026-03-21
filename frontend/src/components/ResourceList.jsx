import { useEffect, useState } from 'react'
import axios from 'axios'

const initialFormState = {
  name: '',
  type: '',
  capacity: 1,
  location: '',
  availabilityStatus: 'ACTIVE',
  metadata: '',
}

function ResourceList() {
  const [resources, setResources] = useState([])
  const [formData, setFormData] = useState(initialFormState)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadResources = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/resources')
      setResources(response.data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load resources.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value,
    }))
  }

  const handleAddResource = async (event) => {
    event.preventDefault()
    try {
      setSubmitting(true)
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
      }
      const response = await axios.post('/api/resources', payload)
      setResources((prev) => [...prev, response.data])
      setFormData(initialFormState)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add resource.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteResource = async (id) => {
    try {
      await axios.delete(`/api/resources/${id}`)
      setResources((prev) => prev.filter((resource) => resource.id !== id))
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete resource.')
    }
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Facilities & Assets</h1>

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h2 className="h5 mb-3">Add New Resource</h2>
          <form onSubmit={handleAddResource}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="name" className="form-label">Name</label>
                <input id="name" name="name" value={formData.name} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="col-md-4">
                <label htmlFor="type" className="form-label">Type</label>
                <input id="type" name="type" value={formData.type} onChange={handleInputChange} className="form-control" placeholder="Lab, Room..." required />
              </div>
              <div className="col-md-4">
                <label htmlFor="capacity" className="form-label">Capacity</label>
                <input id="capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="col-md-4">
                <label htmlFor="location" className="form-label">Location</label>
                <input id="location" name="location" value={formData.location} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="col-md-4">
                <label htmlFor="availabilityStatus" className="form-label">Status</label>
                <select id="availabilityStatus" name="availabilityStatus" value={formData.availabilityStatus} onChange={handleInputChange} className="form-select" required>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="metadata" className="form-label">Metadata</label>
                <input id="metadata" name="metadata" value={formData.metadata} onChange={handleInputChange} className="form-control" placeholder="Optional JSON or text" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Resource'}
            </button>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h5 mb-3">Resource List</h2>
          {loading ? (
            <p className="mb-0">Loading resources...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Metadata</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">No resources found.</td>
                    </tr>
                  ) : (
                    resources.map((resource) => (
                      <tr key={resource.id}>
                        <td>{resource.id}</td>
                        <td>{resource.name}</td>
                        <td>{resource.type}</td>
                        <td>{resource.capacity}</td>
                        <td>{resource.location}</td>
                        <td>{resource.availabilityStatus}</td>
                        <td>{resource.metadata || '-'}</td>
                        <td>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteResource(resource.id)}>
                            Delete
                          </button>
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
    </div>
  )
}

export default ResourceList