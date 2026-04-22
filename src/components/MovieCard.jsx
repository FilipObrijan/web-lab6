import { useState } from 'react'
import './MovieCard.css'

function MovieCard({ movie, onRemove, onToggleLike, onUpdateStatus }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'watched':
        return 'fa-eye'
      case 'planned':
        return 'fa-calendar'
      default:
        return 'fa-hourglass-half'
    }
  }

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'watched':
        return '#10b981'
      case 'planned':
        return '#8b5cf6'
      default:
        return '#f59e0b'
    }
  }

  return (
    <div className="movie-card">
      <div className="movie-card-header">
        <div className="movie-info">
          <h3 className="movie-title">{movie.title}</h3>
          <div className="movie-meta">
            <span className="movie-year">{movie.year}</span>
            <span className="movie-genre">{movie.genre}</span>
          </div>
        </div>
        <button
          className={`like-button ${movie.isLiked ? 'liked' : ''}`}
          onClick={() => onToggleLike(movie.id)}
          title={movie.isLiked ? 'Unlike' : 'Like'}
        >
          <i className={`fas fa-heart`}></i>
        </button>
      </div>

      <div className="movie-content">
        <div className="rating-badge">
          <i className="fas fa-star"></i>
          {movie.rating}/10
        </div>

        {movie.director && (
          <p className="movie-director">
            <strong>Director:</strong> {movie.director}
          </p>
        )}

        <div className="status-section">
          <span
            className="status-badge"
            style={{ borderColor: getStatusColor(movie.status) }}
          >
            <i className={`fas ${getStatusIcon(movie.status)}`}></i>
            {getStatusLabel(movie.status)}
          </span>
        </div>
      </div>

      <div className="movie-footer">
        <button
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          More
        </button>
        <button
          className="remove-button"
          onClick={() => onRemove(movie.id)}
          title="Remove from list"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>

      {isExpanded && (
        <div className="movie-expanded">
          <div className="status-selector">
            <label>Change Status:</label>
            <select
              value={movie.status}
              onChange={(e) => onUpdateStatus(movie.id, e.target.value)}
            >
              <option value="unwatched">Unwatched</option>
              <option value="watched">Watched</option>
              <option value="planned">Planned</option>
            </select>
          </div>
          <div className="added-date">
            <small>Added: {new Date(movie.dateAdded).toLocaleDateString()}</small>
          </div>
        </div>
      )}
    </div>
  )
}

export default MovieCard
