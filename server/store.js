import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDirectory = path.join(__dirname, 'data')
const dataFilePath = path.join(dataDirectory, 'movies.json')

const seedMovies = [
  {
    id: 1710000000001,
    title: 'Inception',
    year: 2010,
    genre: 'Sci-Fi',
    rating: 9,
    director: 'Christopher Nolan',
    status: 'watched',
    isLiked: true,
    externalId: 'seed-inception',
    dateAdded: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z'
  },
  {
    id: 1710000000002,
    title: 'The Matrix',
    year: 1999,
    genre: 'Sci-Fi',
    rating: 10,
    director: 'Lana Wachowski',
    status: 'watched',
    isLiked: true,
    externalId: 'seed-matrix',
    dateAdded: '2026-05-01T10:05:00.000Z',
    updatedAt: '2026-05-01T10:05:00.000Z'
  },
  {
    id: 1710000000003,
    title: 'Interstellar',
    year: 2014,
    genre: 'Sci-Fi',
    rating: 9,
    director: 'Christopher Nolan',
    status: 'planned',
    isLiked: false,
    externalId: 'seed-interstellar',
    dateAdded: '2026-05-01T10:10:00.000Z',
    updatedAt: '2026-05-01T10:10:00.000Z'
  },
  {
    id: 1710000000004,
    title: 'Arrival',
    year: 2016,
    genre: 'Drama',
    rating: 8,
    director: 'Denis Villeneuve',
    status: 'unwatched',
    isLiked: false,
    externalId: 'seed-arrival',
    dateAdded: '2026-05-01T10:15:00.000Z',
    updatedAt: '2026-05-01T10:15:00.000Z'
  },
  {
    id: 1710000000005,
    title: 'Spirited Away',
    year: 2001,
    genre: 'Animation',
    rating: 10,
    director: 'Hayao Miyazaki',
    status: 'watched',
    isLiked: true,
    externalId: 'seed-spirited-away',
    dateAdded: '2026-05-01T10:20:00.000Z',
    updatedAt: '2026-05-01T10:20:00.000Z'
  },
  {
    id: 1710000000006,
    title: 'Dune',
    year: 2021,
    genre: 'Fantasy',
    rating: 8,
    director: 'Denis Villeneuve',
    status: 'planned',
    isLiked: false,
    externalId: 'seed-dune',
    dateAdded: '2026-05-01T10:25:00.000Z',
    updatedAt: '2026-05-01T10:25:00.000Z'
  },
  {
    id: 1710000000007,
    title: 'Parasite',
    year: 2019,
    genre: 'Thriller',
    rating: 9,
    director: 'Bong Joon-ho',
    status: 'watched',
    isLiked: true,
    externalId: 'seed-parasite',
    dateAdded: '2026-05-01T10:30:00.000Z',
    updatedAt: '2026-05-01T10:30:00.000Z'
  },
  {
    id: 1710000000008,
    title: 'Whiplash',
    year: 2014,
    genre: 'Drama',
    rating: 9,
    director: 'Damien Chazelle',
    status: 'unwatched',
    isLiked: false,
    externalId: 'seed-whiplash',
    dateAdded: '2026-05-01T10:35:00.000Z',
    updatedAt: '2026-05-01T10:35:00.000Z'
  },
  {
    id: 1710000000009,
    title: 'The Grand Budapest Hotel',
    year: 2014,
    genre: 'Comedy',
    rating: 8,
    director: 'Wes Anderson',
    status: 'planned',
    isLiked: false,
    externalId: 'seed-grand-budapest',
    dateAdded: '2026-05-01T10:40:00.000Z',
    updatedAt: '2026-05-01T10:40:00.000Z'
  },
  {
    id: 1710000000010,
    title: 'The Dark Knight',
    year: 2008,
    genre: 'Action',
    rating: 10,
    director: 'Christopher Nolan',
    status: 'watched',
    isLiked: true,
    externalId: 'seed-dark-knight',
    dateAdded: '2026-05-01T10:45:00.000Z',
    updatedAt: '2026-05-01T10:45:00.000Z'
  },
  {
    id: 1710000000011,
    title: 'Her',
    year: 2013,
    genre: 'Romance',
    rating: 8,
    director: 'Spike Jonze',
    status: 'unwatched',
    isLiked: false,
    externalId: 'seed-her',
    dateAdded: '2026-05-01T10:50:00.000Z',
    updatedAt: '2026-05-01T10:50:00.000Z'
  },
  {
    id: 1710000000012,
    title: 'Mad Max: Fury Road',
    year: 2015,
    genre: 'Action',
    rating: 9,
    director: 'George Miller',
    status: 'planned',
    isLiked: false,
    externalId: 'seed-mad-max',
    dateAdded: '2026-05-01T10:55:00.000Z',
    updatedAt: '2026-05-01T10:55:00.000Z'
  }
]

async function ensureStoreFile() {
  await fs.mkdir(dataDirectory, { recursive: true })

  try {
    await fs.access(dataFilePath)
  } catch {
    await fs.writeFile(dataFilePath, JSON.stringify(seedMovies, null, 2), 'utf8')
  }
}

export async function readMovies() {
  await ensureStoreFile()
  const rawContent = await fs.readFile(dataFilePath, 'utf8')
  const parsed = JSON.parse(rawContent)
  return Array.isArray(parsed) ? parsed : []
}

export async function writeMovies(movies) {
  await ensureStoreFile()
  await fs.writeFile(dataFilePath, JSON.stringify(movies, null, 2), 'utf8')
}