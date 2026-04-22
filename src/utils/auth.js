// Simple password hashing utility using bcryptjs
import * as bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS)
  } catch (error) {
    console.error('Error hashing password:', error)
    throw error
  }
}

export async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

// User management functions
export function getAllUsers() {
  const usersJSON = localStorage.getItem('users')
  return usersJSON ? JSON.parse(usersJSON) : {}
}

export function getUserByUsername(username) {
  const users = getAllUsers()
  return users[username] || null
}

export async function createUser(username, password) {
  const users = getAllUsers()
  
  if (users[username]) {
    throw new Error('Username already exists')
  }
  
  if (username.trim().length < 3) {
    throw new Error('Username must be at least 3 characters')
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }
  
  const passwordHash = await hashPassword(password)
  
  users[username] = {
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
    movies: []
  }
  
  localStorage.setItem('users', JSON.stringify(users))
  return users[username]
}

export async function authenticateUser(username, password) {
  const user = getUserByUsername(username)
  
  if (!user) {
    throw new Error('Username or password incorrect')
  }
  
  const isPasswordValid = await verifyPassword(password, user.passwordHash)
  
  if (!isPasswordValid) {
    throw new Error('Username or password incorrect')
  }
  
  return user
}

export function getUserMovies(username) {
  const user = getUserByUsername(username)
  return user ? user.movies : []
}

export function updateUserMovies(username, movies) {
  const users = getAllUsers()
  if (users[username]) {
    users[username].movies = movies
    localStorage.setItem('users', JSON.stringify(users))
  }
}

export function setCurrentUser(username) {
  if (username) {
    localStorage.setItem('currentUser', username)
  } else {
    localStorage.removeItem('currentUser')
  }
}

export function getCurrentUser() {
  return localStorage.getItem('currentUser')
}

export function logout() {
  localStorage.removeItem('currentUser')
}
