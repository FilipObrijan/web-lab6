# Movie Watchlist Manager

A modern, client-side web application for managing your personal movie watchlist. Add, organize, rate, and track movies with a beautiful dark/light theme interface.

## 🎬 Application Overview

The Movie Watchlist Manager is a fully client-side web application built with React and Vite that allows users to create and manage their personal movie collection. The app features entity manipulation (add/remove), liking/favoriting, filtering, and persistent storage using browser localStorage.

### Key Features

- ✨ **Add Movies**: Add movies with title, year, genre, rating, and director information
- ❤️ **Like/Favorite**: Mark movies as liked for quick access to your favorites
- 🎯 **Filter Movies**: Filter by status (Watched, Unwatched, Planned) or search by title/genre
- 📊 **Statistics**: View real-time stats of your movie collection
- 🌓 **Dark/Light Mode**: Toggle between light and dark themes
- 💾 **Local Storage**: All data persists in browser localStorage
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- ♿ **Accessible**: Built with semantic HTML and ARIA attributes

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 4.3.9
- **Styling**: Custom CSS with CSS Variables for theming
- **Icons**: Font Awesome 6.4.0
- **State Management**: React Hooks
- **Storage**: Browser localStorage
- **Hosting**: GitHub Pages

## 📊 Application Flow

### Main Flow

```
User Opens App
    ↓
Load Theme & Movies from localStorage
    ↓
Display Movie Watchlist
    ↓
┌─────────────┬──────────────┬──────────────┐
│             │              │              │
Add New Movie  Filter Movies  Like/Unlike   Remove Movie
│             │              │              │
└──────┬──────┴──────┬───────┴──────┬───────┘
       │             │             │
Update localStorage globally
       │
Save changes automatically
       │
User sees updated list
```

### Add Movie Flow

```
Click "Add New Movie" Button
    ↓
Form Appears (Collapsible)
    ↓
Enter Movie Details:
  - Title (required)
  - Year (auto-filled with current year)
  - Genre (dropdown: Action, Comedy, Drama, Horror, Romance, Sci-Fi, Thriller, Animation, Documentary, Fantasy)
  - Rating (1-10 scale)
  - Director (optional)
  - Status (Unwatched, Watched, Planned)
    ↓
Click "Add Movie" Button
    ↓
Generate unique ID (timestamp)
Movie added to top of list
    ↓
localStorage updated
Form resets and collapses
```

### Filter & Search Flow

```
User interacts with Filter Bar
    ↓
┌──────────────┬────────────┬───────────────┐
│              │            │               │
Search Input   Filter Tabs  Real-time Search
│              │            │               │
All (total)    Watched      Title Search
Unwatched      Planned      Genre Search
└──────┬───────┴────┬───────┴───────┬───────┘
       │            │               │
Movies filtered in real-time
       │
Display matching results
       │
"No movies found" message if empty
```

### Movie Card Interaction Flow

```
Movie Card Displayed
    ↓
┌─────────────┬──────────────┬─────────────┐
│             │              │             │
Like Button   More Button    Delete Button
│             │              │             │
Heart Icon    Expand Card    Trash Icon
│             │              │             │
└──────┬──────┴──────┬───────┴──────┬──────┘
       │             │             │
Like: Toggle liked status
       ↓
Update Movie stats

More: Show Details
       ↓
  - Change Status dropdown
  - Display added date
  - Collapsible details

Delete: Remove from list
       ↓
Confirm removal
localStorage updated
```

### Theme Toggle Flow

```
Click Moon/Sun Icon in Header
    ↓
Toggle Theme (light ↔ dark)
    ↓
Update HTML attribute: [data-theme="dark/light"]
    ↓
CSS Variables update automatically
    ↓
Save theme to localStorage
    ↓
Page re-renders with new colors
All components respond instantly
```

### Statistics Panel Flow

```
Sidebar Statistics Widget
    ↓
Real-time tracking of:
  - Total Movies count
  - Watched movies count
  - Unwatched movies count
  - Planned movies count
  - Liked movies count
    ↓
Updates instantly when:
  - Movie added
  - Movie removed
  - Movie status changed
  - Movie liked/unliked
```

## 📦 Data Model

Each movie object contains:

```javascript
{
  id: number,              // Unique timestamp ID
  title: string,           // Movie title
  year: number,            // Release year
  genre: string,           // Genre category
  rating: number,          // User rating (1-10)
  director: string,        // Director name (optional)
  status: string,          // 'watched', 'unwatched', 'planned'
  isLiked: boolean,        // Like/favorite status
  dateAdded: string        // ISO timestamp when added
}
```

## 💾 LocalStorage Schema

```javascript
// Movies Collection
localStorage.setItem('movies', JSON.stringify([
  { /* movie objects */ }
]))

// Theme Preference
localStorage.setItem('theme', 'light' | 'dark')
```

## 🎨 Theme System

The application uses CSS Variables for dynamic theming:

### Light Theme
- Background: #ffffff
- Surface: #f9fafb
- Text Primary: #1f2937
- Primary Color: #6366f1 (Indigo)
- Secondary Color: #ec4899 (Pink)

### Dark Theme
- Background: #1f2937
- Surface: #111827
- Text Primary: #f3f4f6
- Primary Color: #818cf8 (Light Indigo)
- Secondary Color: #f472b6 (Light Pink)

The theme toggle is saved in localStorage and restored on app reload.

## 📱 Responsive Breakpoints

- **Desktop**: Full layout with sidebar (1200px+)
- **Tablet**: Adjusted grid, single-column sidebar (768px - 1200px)
- **Mobile**: Single-column layout, simplified filters (< 768px)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📋 Development Requirements Met

✅ **Client-side Framework**: React with Hooks
✅ **Entity Manipulation**: Add, remove, like, filter movies
✅ **Custom Theme/Style**: Fully customized CSS with light/dark mode
✅ **Light/Dark Version**: Dynamic theme toggle with localStorage persistence
✅ **Public Link**: Deployed on GitHub Pages
✅ **Runtime State**: All state in React hooks
✅ **Browser Storage**: localStorage for movies and theme preferences
✅ **Git History**: Tracked commits showing development progress
✅ **GitHub Pages Hosting**: Deployed and accessible online

## 📝 Commit History Overview

The git history tracks the following development stages:

1. **Initial Setup**: Project structure, Vite configuration, package.json
2. **Base Components**: Created AddMovieForm, MovieList, MovieCard components
3. **Styling**: Applied custom CSS, theme system, responsive design
4. **Core Features**: Add/remove/like/filter functionality
5. **Theme System**: Light/dark mode toggle with localStorage
6. **localStorage Integration**: Persistent data storage
7. **Polish & Refinement**: UI improvements, animations, accessibility

## 🔄 Git Checkout Instructions

To view the application at different stages of development:

```bash
# View all commits
git log --oneline

# Checkout a specific commit
git checkout <commit-hash>

# Build and run that version
npm install
npm run dev
```

## 🌐 Deployment

The application is deployed on GitHub Pages:
- Base URL: `https://[username].github.io/web-lab6/`
- All assets served from `/web-lab6/` subdirectory
- Client-side routing works via history API

## 📄 License

This project is created for educational purposes as part of laboratory work.

---

**Created for**: Web Development Laboratory Work #6
**Framework**: React 18
**Build**: Vite
**Theme System**: CSS Variables with localStorage persistence
