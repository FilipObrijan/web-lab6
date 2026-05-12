import { useEffect, useRef, useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import MovieList from './components/MovieList'
import AddMovieForm from './components/AddMovieForm'
import MovieSearch from './components/MovieSearch'
import FilterBar from './components/FilterBar'
import ThemeToggle from './components/ThemeToggle'
import UserProfile from './components/UserProfile'
import AuthPage from './components/AuthPage'
import { deleteMovie, fetchMovies, createMovie, updateMovie } from './utils/watchlistApi'

function AppContent() {
  const { currentUser, isLoading, logout } = useAuth()
  const [movies, setMovies] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [theme, setTheme] = useState('light')
  const [moviesError, setMoviesError] = useState('')
  const [isLoadingMovies, setIsLoadingMovies] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [pagination, setPagination] = useState({
    total: 0,
    totalItems: 0,
    skip: 0,
    limit: 6,
    page: 1,
    pageSize: 6,
    pageCount: 1,
    stats: {
      total: 0,
      watched: 0,
      unwatched: 0,
      planned: 0,
      liked: 0
    }
  })
  const moviesRef = useRef([])

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  useEffect(() => {
    moviesRef.current = movies
  }, [movies])

  const loadMovies = async ({ nextFilter = filter, nextSearch = searchTerm, nextPage = page, nextPageSize = pageSize } = {}) => {
    if (!currentUser?.token) {
      setMovies([])
      setPagination({
        total: 0,
        totalItems: 0,
        skip: 0,
        limit: nextPageSize,
        page: 1,
        pageSize: nextPageSize,
        pageCount: 1,
        stats: {
          total: 0,
          watched: 0,
          unwatched: 0,
          planned: 0,
          liked: 0
        }
      })
      return
    }

    try {
      setIsLoadingMovies(true)
      const response = await fetchMovies({
        status: nextFilter,
        search: nextSearch,
        skip: Math.max((nextPage - 1) * nextPageSize, 0),
        limit: nextPageSize
      })

      const nextMovies = Array.isArray(response?.items) ? response.items : []
      moviesRef.current = nextMovies
      setMovies(nextMovies)

      if (response?.meta) {
        setPagination(response.meta)
        if (response.meta.page !== page) {
          setPage(response.meta.page)
        }
        if (response.meta.pageSize !== pageSize) {
          setPageSize(response.meta.pageSize)
        }
      }
      setMoviesError('')
    } catch (error) {
      if (String(error.message || '').toLowerCase().includes('token')) {
        await logout()
      }
      setMoviesError(error.message || 'Failed to load movies')
      console.error('Failed to load movies:', error)
    } finally {
      setIsLoadingMovies(false)
    }
  }

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMovies()
    }, 200)

    return () => clearTimeout(timer)
  }, [currentUser, filter, searchTerm, page, pageSize])

  const addMovie = async (movieData) => {
    const createdMovie = await createMovie({
      ...movieData,
      isLiked: false
    })

    setPage(1)
    moviesRef.current = [createdMovie, ...moviesRef.current]
    setMovies([createdMovie, ...moviesRef.current.filter((movie) => movie.id !== createdMovie.id)])
    await loadMovies({ nextPage: 1 })
    return createdMovie
  }

  const addMovieFromSearch = async (movieData) => {
    const createdMovie = await createMovie({
      ...movieData,
      isLiked: false
    })

    setPage(1)
    await loadMovies({ nextPage: 1 })
    return createdMovie
  }

  const removeMovie = async (id) => {
    await deleteMovie(id)
    await loadMovies()
  }

  const toggleLike = async (id) => {
    const targetMovie = moviesRef.current.find((movie) => movie.id === id)
    if (!targetMovie) {
      return
    }

    await updateMovie(id, { isLiked: !targetMovie.isLiked })
    await loadMovies()
  }

  const updateMovieStatus = async (id, status) => {
    await updateMovie(id, { status })
    await loadMovies()
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const handleFilterChange = (nextFilter) => {
    setPage(1)
    setFilter(nextFilter)
  }

  const handleSearchChange = (value) => {
    setPage(1)
    setSearchTerm(value)
  }

  const handlePageSizeChange = (event) => {
    setPage(1)
    setPageSize(Number.parseInt(event.target.value, 10))
  }

  const stats = pagination.stats
  const totalPages = pagination.pageCount || 1
  const hasResults = movies.length > 0
  const startItem = pagination.total > 0 ? pagination.skip + 1 : 0
  const endItem = pagination.total > 0 ? pagination.skip + movies.length : 0

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <AuthPage />
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="header-title">
              <i className="fas fa-film"></i>
              <h1>Movie Watchlist</h1>
            </div>
            <div className="header-controls">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>
          <UserProfile />
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {moviesError && (
            <div className="empty-state" style={{ marginBottom: '1rem' }}>
              <i className="fas fa-exclamation-triangle"></i>
              <p>{moviesError}</p>
            </div>
          )}
          <div className="app-layout">
            <div className="main-content">
              <AddMovieForm onAddMovie={addMovie} />

              <MovieSearch
                movies={movies}
                onAddMovie={addMovieFromSearch}
              />
              
              <FilterBar 
                filter={filter}
                setFilter={handleFilterChange}
                searchTerm={searchTerm}
                setSearchTerm={handleSearchChange}
                stats={stats}
              />

              <MovieList
                movies={movies}
                onRemove={removeMovie}
                onToggleLike={toggleLike}
                onUpdateStatus={updateMovieStatus}
              />

              {isLoadingMovies && !hasResults && (
                <div className="empty-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading movies...</p>
                </div>
              )}

              {pagination.total === 0 && stats.total > 0 && !isLoadingMovies && (
                <div className="empty-state">
                  <i className="fas fa-search"></i>
                  <p>No movies match your filters</p>
                </div>
              )}

              {stats.total === 0 && !isLoadingMovies && (
                <div className="empty-state">
                  <i className="fas fa-plus-circle"></i>
                  <p>Add your first movie to get started!</p>
                </div>
              )}

              <div className="pagination-bar">
                <div className="pagination-summary">
                  {pagination.total > 0
                    ? `Showing ${startItem}-${endItem} of ${pagination.total} matching movies`
                    : 'No matching movies on this page'}
                </div>
                <div className="pagination-controls">
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </button>
                  <span className="pagination-page">Page {pagination.page} of {totalPages}</span>
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </button>
                  <select value={pageSize} onChange={handlePageSizeChange} className="pagination-size">
                    <option value="4">4 / page</option>
                    <option value="6">6 / page</option>
                    <option value="8">8 / page</option>
                    <option value="12">12 / page</option>
                  </select>
                </div>
              </div>
            </div>

            <aside className="sidebar">
              <div className="stats-panel">
                <h3>Stats</h3>
                <div className="stat-item">
                  <span className="stat-label">Total Movies:</span>
                  <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Watched:</span>
                  <span className="stat-value watched">{stats.watched}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unwatched:</span>
                  <span className="stat-value unwatched">{stats.unwatched}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Planned:</span>
                  <span className="stat-value planned">{stats.planned}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Liked:</span>
                  <span className="stat-value liked">{stats.liked}</span>
                </div>
              </div>

              <div className="stats-panel api-panel">
                <h3>API Session</h3>
                <div className="stat-item">
                  <span className="stat-label">Role:</span>
                  <span className="stat-value">{currentUser.role}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Permissions:</span>
                  <span className="stat-value">{currentUser.permissions.join(', ')}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
