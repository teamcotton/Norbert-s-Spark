import type { FastifyInstance, FastifyServerOptions } from 'fastify'
import Fastify from 'fastify'
import { readFileSync } from 'fs'
import { join } from 'path'
import cors from '@fastify/cors'
import { parse } from 'yaml'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
/**
 * Creates and configures a Fastify server instance with CORS, Swagger, and OpenAPI support.
 *
 * @param {FastifyServerOptions} [options] - Optional Fastify server options to customize the instance.
 * @returns {FastifyInstance} The configured Fastify server instance.
 *
 * @throws {Error} If the OpenAPI specification file (`openapi.yaml`) cannot be found or parsed.
 *
 * @remarks
 * - Registers CORS with permissive settings for development.
 * - Loads and parses the OpenAPI specification from disk.
 * - Registers Swagger and Swagger UI plugins for API documentation.
 * - Registers a `/health` route for health checks.
 * - Reads files from disk and may throw if files are missing or invalid.
 */
export function createFastifyApp(options?: FastifyServerOptions): FastifyInstance {
  const fastify = Fastify({
    logger: true,
    ...options,
  })

  // Register CORS with permissive policy for development
  fastify.register(cors, {
    origin: true, // Allow all origins
    credentials: true, // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  // Load OpenAPI specification
  const openapiPath = join(__dirname, '../../..', 'openapi.yaml')
  const openapiSpec = parse(readFileSync(openapiPath, 'utf8'))

  // Register Swagger
  fastify.register(swagger, {
    mode: 'static',
    specification: {
      document: openapiSpec,
    },
  })

  // Register Swagger UI
  fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  })

  fastify.get('/health', async (_request, _reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  return fastify
}
