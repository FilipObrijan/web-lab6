import { clearToken, getStoredToken, logout } from './auth'

async function apiRequest(path, options = {}) {
  const token = options.token || getStoredToken()

  if (!token) {
    throw new Error('Missing access token. Generate a new token first.')
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  }

  const response = await fetch(path, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  if (response.status === 204) {
    return null
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401) {
      clearToken()
      await logout()
    }

    throw new Error(payload.message || 'API request failed')
  }

  return payload
}

export async function fetchMovies({ status = 'all', search = '', skip = 0, limit = 6 } = {}) {
  const query = new URLSearchParams()

  if (status && status !== 'all') {
    query.set('status', status)
  }

  if (search) {
    query.set('search', search)
  }

  query.set('skip', String(skip))
  query.set('limit', String(limit))

  return apiRequest(`/movies?${query.toString()}`)
}

export async function createMovie(movie) {
  return apiRequest('/movies', {
    method: 'POST',
    body: movie
  })
}

export async function updateMovie(id, updates) {
  return apiRequest(`/movies/${id}`, {
    method: 'PATCH',
    body: updates
  })
}

export async function deleteMovie(id) {
  return apiRequest(`/movies/${id}`, {
    method: 'DELETE'
  })
}