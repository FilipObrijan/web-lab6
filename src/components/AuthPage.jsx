import { useState } from 'react'
import { requestAccessToken } from '../utils/auth'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

function AuthPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('demo-user')
  const [role, setRole] = useState('ADMIN')
  const [permissions, setPermissions] = useState('READ, CREATE, UPDATE, DELETE')
  const [requestMode, setRequestMode] = useState('POST')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const presetPermissions = {
    VISITOR: 'READ',
    WRITER: 'READ, CREATE, UPDATE',
    ADMIN: 'READ, CREATE, UPDATE, DELETE'
  }

  const handleRoleChange = (event) => {
    const nextRole = event.target.value
    setRole(nextRole)

    if (nextRole in presetPermissions) {
      setPermissions(presetPermissions[nextRole])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const tokenResponse = await requestAccessToken({
        username,
        role,
        permissions,
        mode: requestMode
      })

      login(tokenResponse)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <i className="fas fa-film"></i>
            <h1>Movie Watchlist</h1>
          </div>

          <h2 className="auth-title">Generate JWT Access Token</h2>
          <p className="auth-subtitle">The token expires in 1 minute and unlocks the CRUD API.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="demo-user"
                required
                minLength={3}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={role}
                onChange={handleRoleChange}
                disabled={isLoading}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="WRITER">WRITER</option>
                <option value="VISITOR">VISITOR</option>
                <option value="CUSTOM">CUSTOM</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="permissions">Permissions</label>
              <textarea
                id="permissions"
                rows="3"
                value={permissions}
                onChange={(e) => setPermissions(e.target.value)}
                placeholder="READ, CREATE, UPDATE, DELETE"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="requestMode">Request Mode</label>
              <select
                id="requestMode"
                value={requestMode}
                onChange={(e) => setRequestMode(e.target.value)}
                disabled={isLoading}
              >
                <option value="POST">POST JSON body</option>
                <option value="GET">GET query params</option>
              </select>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Generating Token...
                </>
              ) : (
                <>
                  <i className="fas fa-key"></i>
                  Generate Token
                </>
              )}
            </button>
          </form>

          <div className="demo-info">
            <p>
              <i className="fas fa-info-circle"></i>
              Use ADMIN to demo every CRUD action. The frontend talks to the backend API through the JWT you generate here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
