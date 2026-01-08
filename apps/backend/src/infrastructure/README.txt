INFRASTRUCTURE LAYER (External Concerns)

Purpose:
Contains all the technical implementation details that support the application
but are not part of the core business logic. This includes database configuration,
external service setup, and framework initialization.

Contains:
- Database Configuration: Drizzle ORM setup, connection pooling, migrations
- Framework Setup: Fastify server configuration, middleware, plugins
- External Service Configuration: API clients, third-party SDK initialization
- Security: Authentication, authorization, encryption utilities
- Logging: Logger configuration and setup
- Environment Configuration: dotenv setup, config validation
- Dependency Injection: IoC container setup

Rules:
- Provides concrete implementations for technical concerns
- Contains framework and library-specific configuration
- Should not contain business logic
- Wires together all layers through dependency injection
- Handles cross-cutting concerns (logging, monitoring, security)

Example Structure:
infrastructure/
  ├── database/
  │   ├── drizzle.config.ts
  │   ├── schema.ts
  │   └── migrations/
  ├── http/
  │   ├── fastify.config.ts
  │   ├── middleware/
  │   │   ├── auth.middleware.ts
  │   │   └── error.middleware.ts
  │   └── plugins/
  ├── config/
  │   ├── env.config.ts
  │   └── app.config.ts
  ├── security/
  │   ├── jwt.util.ts
  │   └── crypto.util.ts
  └── di/
      └── container.ts                  # Dependency injection setup