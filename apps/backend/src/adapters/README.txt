ADAPTERS LAYER (Interface Adapters)

Purpose:
Converts data between the format most convenient for use cases/domain and the
format most convenient for external agencies like databases, web frameworks,
or external services. Adapters implement the port interfaces defined in the
application layer.

Contains:
- Primary/Driving Adapters (Inbound): Handle incoming requests
  * HTTP Controllers (Fastify routes)
  * CLI Commands
  * WebSocket Handlers
  * GraphQL Resolvers
  
- Secondary/Driven Adapters (Outbound): Implement infrastructure concerns
  * Repository Implementations (PostgreSQL via Drizzle)
  * External Service Clients (Email, SMS, Payment gateways)
  * Message Queue Publishers/Subscribers
  * File System handlers

Rules:
- Implements port interfaces from application layer
- Converts between external formats and internal domain models
- Contains framework-specific code (Fastify, Drizzle, etc.)
- Should be replaceable without affecting domain/application layers

Example Structure:
adapters/
  ├── primary/           # Inbound (Driving) Adapters
  │   ├── http/
  │   │   ├── user.controller.ts
  │   │   └── workout.controller.ts
  │   └── cli/
  │       └── seed-data.command.ts
  └── secondary/         # Outbound (Driven) Adapters
      ├── repositories/
      │   ├── user.repository.ts        # Implements UserRepositoryPort
      │   └── workout.repository.ts
      ├── services/
      │   ├── email.service.ts          # Implements EmailServicePort
      │   └── logger.service.ts
      └── external/
          └── payment.client.ts