import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

const fastify = Fastify({
  logger: true
})

// Register plugins
fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' ? false : true
})

fastify.register(helmet)

// Swagger documentation
fastify.register(swagger, {
  swagger: {
    info: {
      title: 'MTG Draft Simulator API',
      description: 'REST API for Magic: The Gathering Draft Practice Tool',
      version: '1.0.0'
    },
    host: 'localhost:3001',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
})

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
})

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// API Routes (to be added)
fastify.register(async function (fastify) {
  fastify.get('/api', async (request, reply) => {
    return { message: 'MTG Draft Simulator API v1.0.0' }
  })
})

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Server running on http://localhost:${port}`)
    console.log(`📚 API Documentation available at http://localhost:${port}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
