import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { Client } from 'pg'

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

// Database health check endpoint
fastify.get('/health/db', async (request, reply) => {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/mtg_draft_simulator'
    })
    
    await client.connect()
    const result = await client.query('SELECT 1 as test')
    await client.end()
    
    return { 
      status: 'ok', 
      database: 'connected', 
      timestamp: new Date().toISOString() 
    }
  } catch (error) {
    reply.code(500)
    return { 
      status: 'error', 
      database: 'disconnected', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    }
  }
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
