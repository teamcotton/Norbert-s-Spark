SHARED LAYER (Common Utilities)

Purpose:
Contains code that is shared across multiple layers but doesn't belong to any
specific layer. These are typically generic utilities, constants, types, and
helpers that multiple parts of the application need.

Contains:
- Common Types: Shared TypeScript types and interfaces
- Utility Functions: Generic helpers (date formatting, string manipulation)
- Constants: Application-wide constants (error codes, status codes)
- Exceptions: Custom error classes used across layers
- Validators: Generic validation utilities
- Guards: Type guards and assertion functions
- Mapper: Utility for mapping objects
- Types: Custom TypeScript types

Rules:
- Should contain only generic, reusable code
- No business logic or domain-specific code
- No dependencies on other application layers
- Should be framework-agnostic when possible
- Can be used by any layer without creating circular dependencies

Example Structure:
shared/
  ├── types/
  │   ├── common.types.ts
  │   └── pagination.types.ts
  ├── utils/
  │   ├── date.util.ts
  │   ├── string.util.ts
  │   └── validation.util.ts
  ├── constants/
  │   ├── error-codes.ts
  │   └── http-status.ts
  ├── exceptions/
  │   ├── base.exception.ts
  │   ├── validation.exception.ts
  │   └── not-found.exception.ts
  └── guards/
      └── type.guards.ts
