import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import swaggerUi from 'swagger-ui-express'
import { openApiSpec } from './openapi.js'
import { readMovies, writeMovies } from './store.js'

const app = express()
const port = Number.parseInt(process.env.PORT || '3001', 10)
const jwtSecret = process.env.JWT_SECRET || 'lab6-lab7-demo-secret'
const tokenLifetimeSeconds = 60
const allowedRoles = new Set(['VISITOR', 'WRITER', 'ADMIN'])
const permissionSets = {
  VISITOR: ['READ'],
  WRITER: ['READ', 'CREATE', 'UPDATE'],
  ADMIN: ['READ', 'CREATE', 'UPDATE', 'DELETE']
}

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_, response) => {
  response.json({ ok: true })
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))
app.get('/openapi.json', (_, response) => response.json(openApiSpec))

function normalizePermissions(inputPermissions) {
  if (Array.isArray(inputPermissions)) {
    return [...new Set(inputPermissions.map((permission) => String(permission).trim().toUpperCase()).filter(Boolean))]
  }

  if (typeof inputPermissions === 'string' && inputPermissions.trim()) {
    try {
      const parsed = JSON.parse(inputPermissions)
      if (Array.isArray(parsed)) {
        return normalizePermissions(parsed)
      }
    } catch {
      return [...new Set(inputPermissions.split(',').map((permission) => permission.trim().toUpperCase()).filter(Boolean))]
    }
  }

  return []
}

function resolveRole(inputRole, permissions) {
  const normalizedRole = String(inputRole || '').trim().toUpperCase()

  if (normalizedRole && allowedRoles.has(normalizedRole)) {
    return normalizedRole
  }

  if (permissions.includes('DELETE')) {
    return 'ADMIN'
  }

  if (permissions.includes('CREATE') || permissions.includes('UPDATE')) {
    return 'WRITER'
  }

  return 'VISITOR'
}

function buildPermissions(role, explicitPermissions = []) {
  const fallbackPermissions = permissionSets[role] || permissionSets.VISITOR
  const mergedPermissions = explicitPermissions.length > 0 ? explicitPermissions : fallbackPermissions
  return [...new Set(mergedPermissions)]
}

function issueTokenFromInput(input) {
  const username = String(input.username || 'demo-user').trim() || 'demo-user'
  const explicitPermissions = normalizePermissions(input.permissions)
  const role = resolveRole(input.role, explicitPermissions)
  const permissions = buildPermissions(role, explicitPermissions)
  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresAt = issuedAt + tokenLifetimeSeconds

  const token = jwt.sign(
    {
      sub: username,
      username,
      role,
      permissions,
      permissionsSource: explicitPermissions.length > 0 ? 'custom' : 'role'
    },
    jwtSecret,
    { expiresIn: tokenLifetimeSeconds }
  )

  return {
    token,
    username,
    role,
    permissions,
    expiresInSeconds: tokenLifetimeSeconds,
    issuedAt: new Date(issuedAt * 1000).toISOString(),
    expiresAt: new Date(expiresAt * 1000).toISOString()
  }
}

function getBearerToken(request) {
  const header = request.headers.authorization || ''
  if (!header.startsWith('Bearer ')) {
    return ''
  }

  return header.slice(7)
}

function authenticate(request, response, next) {
  const token = getBearerToken(request)
  if (!token) {
    return response.status(401).json({ message: 'Missing bearer token' })
  }

  try {
    request.user = jwt.verify(token, jwtSecret)
    return next()
  } catch {
    return response.status(401).json({ message: 'Token is invalid or expired' })
  }
}

function hasPermission(user, permission) {
  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : []
  return user.role === 'ADMIN' || userPermissions.includes(permission)
}

function authorize(permission) {
  return (request, response, next) => {
    if (!hasPermission(request.user, permission)) {
      return response.status(403).json({ message: `Missing ${permission} permission` })
    }

    return next()
  }
}

function createHttpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function normalizeMovieInput(input, existingMovie = null) {
  const title = String(input.title || '').trim()
  if (!title) {
    throw createHttpError(400, 'Movie title is required')
  }

  const year = Number.parseInt(input.year, 10)
  if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1) {
    throw createHttpError(400, 'Year must be a valid number between 1900 and next year')
  }

  const rating = Number.parseInt(input.rating, 10)
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    throw createHttpError(400, 'Rating must be a number between 1 and 10')
  }

  const status = ['watched', 'unwatched', 'planned'].includes(String(input.status).toLowerCase())
    ? String(input.status).toLowerCase()
    : 'unwatched'

  const normalizedExternalId = String(input.externalId || existingMovie?.externalId || '').trim()
  const existingDateAdded = String(input.dateAdded || existingMovie?.dateAdded || new Date().toISOString())

  return {
    title,
    year,
    genre: String(input.genre || 'Unknown').trim() || 'Unknown',
    rating,
    director: String(input.director || '').trim(),
    status,
    isLiked: Boolean(input.isLiked),
    externalId: normalizedExternalId,
    dateAdded: existingDateAdded
  }
}

function mergeMovie(existingMovie, updates) {
  const nextMovie = {
    ...existingMovie,
    ...updates,
    updatedAt: new Date().toISOString()
  }

  if (typeof updates.isLiked !== 'undefined') {
    nextMovie.isLiked = Boolean(updates.isLiked)
  }

  return nextMovie
}

function buildStats(movies) {
  return {
    total: movies.length,
    watched: movies.filter((movie) => movie.status === 'watched').length,
    unwatched: movies.filter((movie) => movie.status === 'unwatched').length,
    planned: movies.filter((movie) => movie.status === 'planned').length,
    liked: movies.filter((movie) => movie.isLiked).length
  }
}

function filterMovies(movies, { status, search }) {
  const normalizedStatus = String(status || '').trim().toLowerCase()
  const normalizedSearch = String(search || '').trim().toLowerCase()

  return movies.filter((movie) => {
    const matchesStatus = !normalizedStatus || normalizedStatus === 'all' || movie.status === normalizedStatus
    const searchableFields = [movie.title, movie.genre, movie.director].filter(Boolean).join(' ').toLowerCase()
    const matchesSearch = !normalizedSearch || searchableFields.includes(normalizedSearch)
    return matchesStatus && matchesSearch
  })
}

function paginateMovies(movies, query) {
  const rawLimit = Number.parseInt(query.limit || query.pageSize || '6', 10)
  const rawSkip = Number.parseInt(query.skip || '0', 10)
  const rawPage = Number.parseInt(query.page || '1', 10)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 6
  const skip = Number.isFinite(rawSkip) ? Math.max(rawSkip, 0) : 0
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
  const derivedPage = Math.floor(skip / limit) + 1
  const page = rawSkip > 0 ? derivedPage : requestedPage
  const total = movies.length
  const pageCount = total === 0 ? 1 : Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(page, pageCount)
  const safeSkip = total === 0 ? 0 : Math.min((safePage - 1) * limit, Math.max(total - limit, 0))

  return {
    items: movies.slice(safeSkip, safeSkip + limit),
    meta: {
      total,
      totalItems: total,
      skip: safeSkip,
      limit,
      page: safePage,
      pageSize: limit,
      pageCount,
      stats: buildStats(movies)
    }
  }
}

app.get('/token', (request, response) => {
  response.json(issueTokenFromInput(request.query))
})

app.post('/token', (request, response) => {
  response.json(issueTokenFromInput(request.body || {}))
})

app.get('/movies', authenticate, authorize('READ'), async (request, response, next) => {
  try {
    const storedMovies = await readMovies()
    const filteredMovies = filterMovies(storedMovies, request.query).sort((firstMovie, secondMovie) => {
      return new Date(secondMovie.dateAdded || 0).getTime() - new Date(firstMovie.dateAdded || 0).getTime()
    })

    response.json(paginateMovies(filteredMovies, request.query))
  } catch (error) {
    next(error)
  }
})

app.get('/movies/:id', authenticate, authorize('READ'), async (request, response, next) => {
  try {
    const storedMovies = await readMovies()
    const movie = storedMovies.find((item) => String(item.id) === String(request.params.id))

    if (!movie) {
      return response.status(404).json({ message: 'Movie not found' })
    }

    return response.json(movie)
  } catch (error) {
    return next(error)
  }
})

app.post('/movies', authenticate, authorize('CREATE'), async (request, response, next) => {
  try {
    const storedMovies = await readMovies()
    const incomingMovie = normalizeMovieInput(request.body || {})

    const duplicateExists = storedMovies.some((movie) => {
      const sameExternalId = incomingMovie.externalId && movie.externalId && movie.externalId === incomingMovie.externalId
      const sameTitleAndYear = movie.title.toLowerCase() === incomingMovie.title.toLowerCase() && movie.year === incomingMovie.year
      return sameExternalId || sameTitleAndYear
    })

    if (duplicateExists) {
      return response.status(409).json({ message: 'Movie already exists' })
    }

    const createdMovie = {
      ...incomingMovie,
      id: Date.now() + Math.floor(Math.random() * 1000),
      dateAdded: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await writeMovies([createdMovie, ...storedMovies])

    return response.status(201).json(createdMovie)
  } catch (error) {
    return next(error)
  }
})

app.patch('/movies/:id', authenticate, authorize('UPDATE'), async (request, response, next) => {
  try {
    const storedMovies = await readMovies()
    const movieIndex = storedMovies.findIndex((item) => String(item.id) === String(request.params.id))

    if (movieIndex === -1) {
      return response.status(404).json({ message: 'Movie not found' })
    }

    const currentMovie = storedMovies[movieIndex]
    const updates = {}

    if (typeof request.body.title !== 'undefined') {
      updates.title = String(request.body.title || '').trim() || currentMovie.title
    }

    if (typeof request.body.year !== 'undefined') {
      const year = Number.parseInt(request.body.year, 10)
      if (Number.isInteger(year)) {
        updates.year = year
      }
    }

    if (typeof request.body.genre !== 'undefined') {
      updates.genre = String(request.body.genre || '').trim() || currentMovie.genre
    }

    if (typeof request.body.rating !== 'undefined') {
      const rating = Number.parseInt(request.body.rating, 10)
      if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        return response.status(400).json({ message: 'Rating must be a number between 1 and 10' })
      }
      updates.rating = rating
    }

    if (typeof request.body.director !== 'undefined') {
      updates.director = String(request.body.director || '').trim()
    }

    if (typeof request.body.status !== 'undefined') {
      const status = String(request.body.status || '').toLowerCase()
      if (!['watched', 'unwatched', 'planned'].includes(status)) {
        return response.status(400).json({ message: 'Invalid movie status' })
      }
      updates.status = status
    }

    if (typeof request.body.isLiked !== 'undefined') {
      updates.isLiked = Boolean(request.body.isLiked)
    }

    if (typeof request.body.externalId !== 'undefined') {
      updates.externalId = String(request.body.externalId || '').trim()
    }

    const updatedMovie = mergeMovie(currentMovie, updates)
    const duplicateExists = storedMovies.some((movie, index) => {
      if (index === movieIndex) {
        return false
      }

      const sameExternalId = updatedMovie.externalId && movie.externalId && movie.externalId === updatedMovie.externalId
      const sameTitleAndYear = movie.title.toLowerCase() === updatedMovie.title.toLowerCase() && movie.year === updatedMovie.year
      return sameExternalId || sameTitleAndYear
    })

    if (duplicateExists) {
      return response.status(409).json({ message: 'Movie already exists' })
    }

    storedMovies[movieIndex] = updatedMovie
    await writeMovies(storedMovies)

    return response.json(updatedMovie)
  } catch (error) {
    return next(error)
  }
})

app.delete('/movies/:id', authenticate, authorize('DELETE'), async (request, response, next) => {
  try {
    const storedMovies = await readMovies()
    const movieIndex = storedMovies.findIndex((item) => String(item.id) === String(request.params.id))

    if (movieIndex === -1) {
      return response.status(404).json({ message: 'Movie not found' })
    }

    const nextMovies = storedMovies.filter((_, index) => index !== movieIndex)
    await writeMovies(nextMovies)

    return response.status(204).send()
  } catch (error) {
    return next(error)
  }
})

app.use((error, request, response, _next) => {
  if (error?.status) {
    return response.status(error.status).json({ message: error.message })
  }

  console.error(error)
  return response.status(500).json({ message: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`Movie API running on http://localhost:${port}`)
  console.log(`Swagger docs available at http://localhost:${port}/docs`)
})