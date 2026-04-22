import MovieCard from './MovieCard'
import './MovieList.css'

function MovieList({ movies, onRemove, onToggleLike, onUpdateStatus }) {
  return (
    <div className="movie-list">
      {movies.map(movie => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onRemove={onRemove}
          onToggleLike={onToggleLike}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  )
}

export default MovieList
