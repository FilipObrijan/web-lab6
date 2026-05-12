export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Movie Watchlist Lab 7 API',
    version: '1.0.0',
    description: 'JWT-protected CRUD API for the Lab 6 movie entity with pagination and token generation.'
  },
  servers: [
    {
      url: 'http://localhost:3001'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Movie: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1710000001000 },
          title: { type: 'string', example: 'Inception' },
          year: { type: 'integer', example: 2010 },
          genre: { type: 'string', example: 'Sci-Fi' },
          rating: { type: 'integer', example: 9 },
          director: { type: 'string', example: 'Christopher Nolan' },
          status: { type: 'string', example: 'watched' },
          isLiked: { type: 'boolean', example: true },
          externalId: { type: 'string', example: 'seed-inception' },
          dateAdded: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      TokenRequest: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'demo-user' },
          role: { type: 'string', example: 'WRITER' },
          permissions: {
            oneOf: [
              { type: 'array', items: { type: 'string' }, example: ['READ', 'CREATE', 'UPDATE'] },
              { type: 'string', example: 'READ,CREATE,UPDATE' }
            ]
          }
        }
      },
      TokenResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          role: { type: 'string' },
          permissions: { type: 'array', items: { type: 'string' } },
          expiresInSeconds: { type: 'integer', example: 60 },
          expiresAt: { type: 'string', format: 'date-time' }
        }
      },
      MovieListResponse: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Movie' } },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              totalItems: { type: 'integer' },
              skip: { type: 'integer' },
              limit: { type: 'integer' },
              page: { type: 'integer' },
              pageSize: { type: 'integer' },
              pageCount: { type: 'integer' },
              stats: {
                type: 'object',
                properties: {
                  total: { type: 'integer' },
                  watched: { type: 'integer' },
                  unwatched: { type: 'integer' },
                  planned: { type: 'integer' },
                  liked: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/token': {
      get: {
        summary: 'Generate a JWT token using query parameters',
        parameters: [
          { name: 'username', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string' } },
          { name: 'permissions', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'JWT issued', content: { 'application/json': { schema: { $ref: '#/components/schemas/TokenResponse' } } } }
        }
      },
      post: {
        summary: 'Generate a JWT token using JSON body',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TokenRequest' }
            }
          }
        },
        responses: {
          200: { description: 'JWT issued', content: { 'application/json': { schema: { $ref: '#/components/schemas/TokenResponse' } } } }
        }
      }
    },
    '/movies': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'List movies with pagination and filtering',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'skip', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Paginated movies', content: { 'application/json': { schema: { $ref: '#/components/schemas/MovieListResponse' } } } }
        }
      },
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Create movie',
        requestBody: { required: true },
        responses: {
          201: { description: 'Movie created' }
        }
      }
    },
    '/movies/{id}': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'Get movie by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Movie found' }, 404: { description: 'Movie not found' } }
      },
      patch: {
        security: [{ bearerAuth: [] }],
        summary: 'Update movie fields',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Movie updated' }, 404: { description: 'Movie not found' } }
      },
      delete: {
        security: [{ bearerAuth: [] }],
        summary: 'Delete movie',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Movie deleted' }, 404: { description: 'Movie not found' } }
      }
    }
  }
}