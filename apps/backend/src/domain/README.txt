DOMAIN LAYER (Core/Hexagon Center)

Purpose:
This is the heart of the hexagonal architecture containing pure business logic,
entities, and domain services. It has NO dependencies on external frameworks,
databases, or infrastructure concerns.

Contains:
- Entities: Core business objects with identity (e.g., User, Workout, Exercise)
- Value Objects: Immutable objects defined by their attributes (e.g., Email, WorkoutDuration)
- Domain Services: Business logic that doesn't naturally fit in a single entity
- Domain Events: Events that represent something significant that happened in the domain
- Business Rules: Pure functions and validation logic

Rules:
- Must be framework-agnostic (no Fastify, Express, database libraries)
- No external dependencies except language primitives and utility libraries
- Contains only pure business logic
- Defines interfaces (ports) that the application needs but doesn't implement them
- Should be testable without any infrastructure

Example Structure:
domain/
  ├── entities/
  │   ├── user.ts
  │   └── workout.ts
  ├── value-objects/
  │   ├── email.ts
  │   └── password.ts
  ├── services/
  │   └── workout-calculator.ts
  └── events/
      └── user-created.event.ts