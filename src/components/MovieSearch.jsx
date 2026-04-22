import { useMemo, useState } from 'react'
import './MovieSearch.css'

function MovieSearch({ movies, onAddMovie }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const existingIds = useMemo(() => {
    return new Set(movies.map(movie => movie.externalId).filter(Boolean))
  }, [movies])

  const handleSearch = async (event) => {
    event.preventDefault()
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      return
    }

    setIsLoading(true)
    setError('')
    setHasSearched(true)

    try {
      const endpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmedQuery)}&media=movie&limit=10`
      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error('Failed to fetch movies. Please try again.')
      }

      const data = await response.json()
      setResults(Array.isArray(data.results) ? data.results : [])
    } catch (requestError) {
      setResults([])
      setError(requestError.message || 'Something went wrong while searching.')
    } finally {
      setIsLoading(false)
    }
  }

  const toWatchlistMovie = (item) => {
    const releaseYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : new Date().getFullYear()

    return {
      title: item.trackName,
      year: Number.isNaN(releaseYear) ? new Date().getFullYear() : releaseYear,
      genre: item.primaryGenreName || 'Unknown',
      rating: 5,
      director: item.artistName || '',
      status: 'planned',
      externalId: `itunes-${item.trackId}`
    }
  }

  return (
    <section className="movie-search" aria-label="Search movies online">
      <div className="movie-search-header">
        <h2>Search Online Movies</h2>
        <p>Find movies and add them to your watchlist.</p>
      </div>

      <form className="movie-search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search movies like: inception, matrix, dune..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search for movies"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="movie-search-error">{error}</p>}

      {hasSearched && !isLoading && results.length === 0 && !error && (
        <p className="movie-search-empty">No movies found for this query.</p>
      )}

      {results.length > 0 && (
        <div className="movie-search-results">
          {results.map(item => {
            const externalId = `itunes-${item.trackId}`
            const isAdded = existingIds.has(externalId)

            return (
              <article key={externalId} className="movie-search-card">
                <img
                  src={(item.artworkUrl100 || '').replace('100x100bb', '300x300bb')}
                  alt={`${item.trackName} poster`}
                  loading="lazy"
                />
                <div className="movie-search-card-content">
                  <h3>{item.trackName}</h3>
                  <p>{item.primaryGenreName || 'Unknown'} • {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'}</p>
                  <button
                    type="button"
                    onClick={() => onAddMovie(toWatchlistMovie(item))}
                    disabled={isAdded}
                  >
                    {isAdded ? 'Already Added' : 'Add to Watchlist'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default MovieSearch
