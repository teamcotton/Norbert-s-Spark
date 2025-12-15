import fs from 'node:fs'
import path from 'node:path'

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

let postgresContainer: StartedPostgreSqlContainer

// Export the container so teardown logic can access and stop it
export { postgresContainer }

async function globalSetup() {
  console.warn('🚀 Starting E2E test environment setup...')

  try {
    // Start PostgreSQL container
    console.warn('📦 Starting PostgreSQL container...')
    postgresContainer = await new PostgreSqlContainer('postgres:18-alpine')
      .withDatabase('level2gym_test')
      .withUsername('test')
      .withPassword('test')
      .withExposedPorts(5432)
      .start()

    const host = postgresContainer.getHost()
    const port = postgresContainer.getMappedPort(5432)
    const username = postgresContainer.getUsername()
    const password = postgresContainer.getPassword()
    const connectionString = `postgresql://${username}:${password}@${host}:${port}/level2gym_test`
    console.warn(`✅ PostgreSQL container started at ${host}:${port}`)

    // Create required PostgreSQL extensions
    console.warn('🔧 Creating PostgreSQL extensions...')
    const adminClient = postgres(connectionString)
    await adminClient`CREATE EXTENSION IF NOT EXISTS citext`
    await adminClient`CREATE EXTENSION IF NOT EXISTS pgcrypto`
    await adminClient.end()
    console.warn('✅ Extensions created')

    // Run migrations from backend
    console.warn('📝 Running database migrations...')
    const backendMigrationsPath = path.join(process.cwd(), '..', 'backend', 'drizzle')

    const migrationClient = postgres(connectionString, { max: 1 })
    const db = drizzle(migrationClient)

    await migrate(db, { migrationsFolder: backendMigrationsPath })
    await migrationClient.end()
    console.warn('✅ Migrations completed')

    // Save connection info to a file that tests can read
    const testConfig = {
      databaseUrl: connectionString,
      host,
      port,
      containerId: postgresContainer.getId(),
    }

    const configPath = path.join(process.cwd(), 'e2e', '.test-db-config.json')
    fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2))

    // Set environment variable for the test run
    process.env.DATABASE_URL = connectionString
    process.env.TEST_DATABASE_URL = connectionString

    console.warn('✅ E2E test environment ready!')
    console.warn(`📊 Database running at ${host}:${port}`)
  } catch (error) {
    console.error('❌ Failed to set up E2E test environment:', error)
    if (postgresContainer) {
      try {
        await postgresContainer.stop()
        console.warn('🛑 PostgreSQL container stopped due to setup failure.')
      } catch (stopError) {
        console.error('⚠️ Failed to stop PostgreSQL container:', stopError)
      }
    }
    throw error
  }
}

export default globalSetup
