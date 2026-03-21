import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((data) => {
        setMessage(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setMessage('Failed to fetch backend message.')
        setLoading(false)
      })
  }, [])

  return (
    <>
      <section id="center">
        <div>
          <h1>Smart Campus Operations Hub</h1>
          <p style={{ fontSize: '18px', marginTop: '20px' }}>
            <strong>Backend Response:</strong>
          </p>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '8px',
            marginTop: '10px',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {loading ? (
              <p style={{ color: '#666' }}>Loading...</p>
            ) : error ? (
              <p style={{ color: 'crimson' }}>✗ Error: {error}</p>
            ) : (
              <p style={{ color: 'green', fontWeight: 'bold', fontSize: '16px' }}>✓ {message}</p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default App
