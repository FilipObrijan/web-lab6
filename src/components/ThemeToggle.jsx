import './ThemeToggle.css'

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
    </button>
  )
}

export default ThemeToggle
