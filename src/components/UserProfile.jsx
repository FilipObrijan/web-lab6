import { useAuth } from '../context/AuthContext'
import './UserProfile.css'

function UserProfile() {
  const { currentUser, logout } = useAuth()

  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        <div className="user-details">
          <span className="user-name">{currentUser}</span>
          <small className="user-status">Logged In</small>
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
