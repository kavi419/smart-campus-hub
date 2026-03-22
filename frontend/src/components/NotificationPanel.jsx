import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

function formatDate(value) {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString()
}

function NotificationPanel({ userId, role }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`/api/notifications/user/${userId}`)
      setNotifications(response.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(
        `/api/notifications/${notificationId}/read`,
        {},
      )

      setNotifications((prev) => prev.map((item) => (
        item.id === notificationId ? { ...item, read: true } : item
      )))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to mark notification as read.')
    }
  }

  return (
    <div className="notification-bell-wrap mb-4">
      <button
        type="button"
        className="btn btn-outline-dark position-relative"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="notification-bell-icon">Bell</span>
        <span className="notification-bell-symbol" aria-hidden="true">\uD83D\uDD14</span>
        {unreadCount > 0 && <span className="badge rounded-pill text-bg-danger notification-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="card shadow notification-dropdown">
          <div className="card-body p-2">
            <div className="d-flex justify-content-between align-items-center px-2 py-1">
              <strong>Notifications</strong>
              <button type="button" className="btn btn-sm btn-link" onClick={loadNotifications}>Refresh</button>
            </div>

            <div className="px-2 pb-1 small text-muted">User #{userId} ({role})</div>

            {error && <div className="alert alert-danger py-1 mb-2">{error}</div>}

            {loading ? (
              <p className="mb-0 px-2 py-2">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-muted mb-0 px-2 py-2">No notifications yet.</p>
            ) : (
              <ul className="list-group notification-list">
                {notifications.map((notification) => (
                  <li key={notification.id} className="list-group-item d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="fw-semibold small">
                        {notification.type}
                        {!notification.read && <span className="badge text-bg-primary ms-2">NEW</span>}
                      </div>
                      <div className="small">{notification.message}</div>
                      <div className="small text-muted mt-1">{formatDate(notification.createdAt)}</div>
                    </div>
                    {!notification.read && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationPanel
