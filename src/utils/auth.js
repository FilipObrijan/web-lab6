import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'

function ensureFirebaseConfigured() {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* values in your environment.')
  }
}

function normalizeUsername(username) {
  return username.trim().toLowerCase()
}

function usernameToEmail(username) {
  const normalized = normalizeUsername(username)
  const isValid = /^[a-z0-9._-]{3,30}$/.test(normalized)

  if (!isValid) {
    throw new Error('Username can use only letters, numbers, dot, underscore, hyphen (3-30 chars).')
  }

  return `${normalized}@watchlist.app`
}

function firebaseErrorToMessage(error, fallback) {
  if (error?.code === 'auth/email-already-in-use') {
    return 'Username already exists'
  }

  if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/user-not-found') {
    return 'Username or password incorrect'
  }

  if (error?.code === 'auth/weak-password') {
    return 'Password must be at least 6 characters'
  }

  return fallback
}

async function getUsernameByUser(firebaseUser) {
  const usernameFromProfile = firebaseUser.displayName
  if (usernameFromProfile) {
    return usernameFromProfile
  }

  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
  if (userDoc.exists()) {
    return userDoc.data().username || firebaseUser.email?.split('@')[0] || 'user'
  }

  return firebaseUser.email?.split('@')[0] || 'user'
}

export async function createUser(username, password) {
  ensureFirebaseConfigured()

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }

  try {
    const email = usernameToEmail(username)
    const normalizedUsername = normalizeUsername(username)
    const credentials = await createUserWithEmailAndPassword(auth, email, password)

    await updateProfile(credentials.user, {
      displayName: normalizedUsername
    })

    await setDoc(doc(db, 'users', credentials.user.uid), {
      username: normalizedUsername,
      movies: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })

    return {
      uid: credentials.user.uid,
      username: normalizedUsername,
      email: credentials.user.email
    }
  } catch (error) {
    throw new Error(firebaseErrorToMessage(error, 'Unable to create account'))
  }
}

export async function authenticateUser(username, password) {
  ensureFirebaseConfigured()

  try {
    const email = usernameToEmail(username)
    const credentials = await signInWithEmailAndPassword(auth, email, password)
    const resolvedUsername = await getUsernameByUser(credentials.user)

    return {
      uid: credentials.user.uid,
      username: resolvedUsername,
      email: credentials.user.email
    }
  } catch (error) {
    throw new Error(firebaseErrorToMessage(error, 'Unable to sign in'))
  }
}

export function observeAuthState(callback) {
  ensureFirebaseConfigured()

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null)
      return
    }

    const username = await getUsernameByUser(firebaseUser)

    callback({
      uid: firebaseUser.uid,
      username,
      email: firebaseUser.email
    })
  })
}

export async function getUserMovies(userId) {
  ensureFirebaseConfigured()

  const userDoc = await getDoc(doc(db, 'users', userId))
  if (!userDoc.exists()) {
    return []
  }

  return userDoc.data().movies || []
}

export async function updateUserMovies(userId, movies) {
  ensureFirebaseConfigured()

  await setDoc(doc(db, 'users', userId), {
    movies,
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export async function logout() {
  ensureFirebaseConfigured()
  await signOut(auth)
}
