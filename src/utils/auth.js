const STORAGE_KEY = 'watchlist-access-token'

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  return atob(normalized + padding)
}

export function decodeToken(token) {
  if (!token) {
    return null
  }

  try {
    const [, payload] = token.split('.')
    if (!payload) {
      return null
    }

    return JSON.parse(base64UrlDecode(payload))
  } catch {
    return null
  }
}

export function getStoredToken() {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function saveToken(token) {
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getCurrentSession() {
  const token = getStoredToken()
  if (!token) {
    return null
  }

  const decoded = decodeToken(token)
  if (!decoded?.exp) {
    clearToken()
    return null
  }

  if (decoded.exp * 1000 <= Date.now()) {
    clearToken()
    return null
  }

  return {
    token,
    username: decoded.username || decoded.sub || 'demo-user',
    role: decoded.role || 'VISITOR',
    permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
    expiresAt: decoded.exp * 1000
  }
}

export function observeAuthState(callback) {
  callback(getCurrentSession())
  return () => {}
}

function normalizePermissions(permissions) {
  if (Array.isArray(permissions)) {
    return permissions.map((permission) => String(permission).trim().toUpperCase()).filter(Boolean)
  }

  if (typeof permissions === 'string') {
    return permissions.split(',').map((permission) => permission.trim().toUpperCase()).filter(Boolean)
  }

  return []
}

export async function requestAccessToken({ username, role, permissions, mode = 'POST' }) {
  const normalizedPermissions = normalizePermissions(permissions)
  const normalizedRole = String(role || 'VISITOR').trim().toUpperCase()

  const response = mode === 'GET'
    ? await fetch(`/token?username=${encodeURIComponent(username || 'demo-user')}&role=${encodeURIComponent(normalizedRole)}&permissions=${encodeURIComponent(normalizedPermissions.join(','))}`)
    : await fetch('/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username || 'demo-user',
          role: normalizedRole,
          permissions: normalizedPermissions
        })
      })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'Unable to generate access token')
  }

  return payload
}

export async function logout() {
  clearToken()
}
