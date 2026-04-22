import { useState, useEffect } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import MovieList from './components/MovieList'
import AddMovieForm from './components/AddMovieForm'
import FilterBar from './components/FilterBar'
import ThemeToggle from './components/ThemeToggle'
import UserProfile from './components/UserProfile'
import AuthPage from './components/AuthPage'
import { getUserMovies, updateUserMovies } from './utils/auth'

function AppContent() {
  const { currentUser, isLoading } = useAuth()
  const [movies, setMovies] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [theme, setTheme] = useState('light')

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  // Load user's movies when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const userMovies = getUserMovies(currentUser)
      setMovies(userMovies)
    }
  }, [currentUser])

  // Save movies whenever they change
  useEffect(() => {
    if (currentUser) {
      updateUserMovies(currentUser, movies)
    }
  }, [movies, currentUser])

  // Save theme whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const addMovie = (movieData) => {
    const newMovie = {
      ...movieData,
      id: Date.now(),
      isLiked: false,
      dateAdded: new Date().toISOString()
    }
    setMovies([newMovie, ...movies])
  }

  const removeMovie = (id) => {
    setMovies(movies.filter(m => m.id !== id))
  }

  const toggleLike = (id) => {
    setMovies(movies.map(m =>
      m.id === id ? { ...m, isLiked: !m.isLiked } : m
    ))
  }

  const updateMovieStatus = (id, status) => {
    setMovies(movies.map(m =>
      m.id === id ? { ...m, status } : m
    ))
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Filter movies
  const filteredMovies = movies.filter(movie => {
    const matchesFilter = filter === 'all' || movie.status === filter
    const matchesSearch = 
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Statistics
  const stats = {
    total: movies.length,
    watched: movies.filter(m => m.status === 'watched').length,
    unwatched: movies.filter(m => m.status === 'unwatched').length,
    planned: movies.filter(m => m.status === 'planned').length,
    liked: movies.filter(m => m.isLiked).length
  }

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
          <div className="app-layout">
            <div className="main-content">
              <AddMovieForm onAddMovie={addMovie} />
              
              <FilterBar 
                filter={filter}
                setFilter={setFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                stats={stats}
              />

              <MovieList
                movies={filteredMovies}
                onRemove={removeMovie}
                onToggleLike={toggleLike}
                onUpdateStatus={updateMovieStatus}
              />

              {filteredMovies.length === 0 && movies.length > 0 && (
                <div className="empty-state">
                  <i className="fas fa-search"></i>
                  <p>No movies match your filters</p>
                </div>
              )}

              {movies.length === 0 && (
                <div className="empty-state">
                  <i className="fas fa-plus-circle"></i>
                  <p>Add your first movie to get started!</p>
                </div>
              )}
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
