import './FilterBar.css'

function FilterBar({ filter, setFilter, searchTerm, setSearchTerm, stats }) {
  return (
    <div className="filter-bar">
      <div className="search-section">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search by title or genre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <i className="fas fa-film"></i>
          All {stats.total > 0 && `(${stats.total})`}
        </button>
        <button
          className={`filter-btn ${filter === 'watched' ? 'active' : ''}`}
          onClick={() => setFilter('watched')}
        >
          <i className="fas fa-eye"></i>
          Watched {stats.watched > 0 && `(${stats.watched})`}
        </button>
        <button
          className={`filter-btn ${filter === 'unwatched' ? 'active' : ''}`}
          onClick={() => setFilter('unwatched')}
        >
          <i className="fas fa-hourglass-half"></i>
          Unwatched {stats.unwatched > 0 && `(${stats.unwatched})`}
        </button>
        <button
          className={`filter-btn ${filter === 'planned' ? 'active' : ''}`}
          onClick={() => setFilter('planned')}
        >
          <i className="fas fa-calendar"></i>
          Planned {stats.planned > 0 && `(${stats.planned})`}
        </button>
      </div>
    </div>
  )
}

export default FilterBar
