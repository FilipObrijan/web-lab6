import { useAuth } from '../context/AuthContext'
import './UserProfile.css'

function UserProfile() {
  const { currentUser, logout } = useAuth()
  const expiresAtLabel = currentUser?.expiresAt ? new Date(currentUser.expiresAt).toLocaleTimeString() : 'Unknown'

  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        <div className="user-details">
          <span className="user-name">{currentUser?.username || 'User'}</span>
          <small className="user-status">Role: {currentUser?.role || 'VISITOR'} · Expires: {expiresAtLabel}</small>
        </div>
      </div>
      <button
        className="logout-btn"
        onClick={logout}
        title="Logout"
      >
        <i className="fas fa-sign-out-alt"></i>
      </button>
    </div>
  )
}

export default UserProfile
