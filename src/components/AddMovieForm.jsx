import { useState } from 'react'
import './AddMovieForm.css'

function AddMovieForm({ onAddMovie }) {
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    genre: 'Action',
    rating: 5,
    director: '',
    status: 'unwatched'
  })

  const genres = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Romance',
    'Sci-Fi', 'Thriller', 'Animation', 'Documentary', 'Fantasy'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'rating' ? parseInt(value) : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      return
    }

    Promise.resolve(onAddMovie(formData))
      .then((result) => {
        if (!result) {
          return
        }

        setError('')
        setFormData({
          title: '',
          year: new Date().getFullYear(),
          genre: 'Action',
          rating: 5,
          director: '',
          status: 'unwatched'
        })
        setShowForm(false)
      })
      .catch((requestError) => {
        setError(requestError.message || 'Unable to add movie')
      })
  }

  return (
    <div className="add-movie-form">
      <div className="form-header">
        <h2>Add New Movie</h2>
        <button
          className="toggle-button"
          onClick={() => setShowForm(!showForm)}
        >
          <i className={`fas fa-${showForm ? 'times' : 'plus'}`}></i>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Movie Title *</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., The Shawshank Redemption"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                id="year"
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="genre">Genre</label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
              >
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="rating">Rating (1-10)</label>
              <input
                id="rating"
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="1"
                max="10"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="director">Director</label>
            <input
              id="director"
              type="text"
              name="director"
              value={formData.director}
              onChange={handleChange}
              placeholder="Optional: Director name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="unwatched">Unwatched</option>
              <option value="watched">Watched</option>
              <option value="planned">Planned</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-plus"></i> Add Movie
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}
        </form>
      )}
    </div>
  )
}

export default AddMovieForm
