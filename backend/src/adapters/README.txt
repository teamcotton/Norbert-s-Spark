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

========================================
CODE EXAMPLES
========================================

1. PRIMARY ADAPTER - HTTP CONTROLLER (adapters/primary/http/user.controller.ts):

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case'
import { RegisterUserDto } from '../../../application/dtos/register-user.dto'

export class UserController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  registerRoutes(app: FastifyInstance): void {
    app.post('/users/register', this.register.bind(this))
    app.get('/users/:id', this.getUser.bind(this))
  }

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Convert HTTP request to DTO
      const dto = RegisterUserDto.validate(request.body)
      
      // Execute use case
      const result = await this.registerUserUseCase.execute(dto)
      
      // Convert result to HTTP response
      reply.code(201).send({
        success: true,
        data: result
      })
    } catch (error) {
      const err = error as Error
      reply.code(400).send({
        success: false,
        error: err.message
      })
    }
  }

  async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    // Implementation here
    reply.send({ id: request.params.id })
  }
}

2. PRIMARY ADAPTER - CLI COMMAND (adapters/primary/cli/seed-data.command.ts):

import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case'
import { RegisterUserDto } from '../../../application/dtos/register-user.dto'

export class SeedDataCommand {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  async execute(): Promise<void> {
    console.log('Seeding database...')

    const users = [
      { email: 'john@example.com', password: 'password123', name: 'John Doe' },
      { email: 'jane@example.com', password: 'password123', name: 'Jane Smith' }
    ]

    for (const userData of users) {
      try {
        const dto = new RegisterUserDto(userData.email, userData.password, userData.name)
        await this.registerUserUseCase.execute(dto)
        console.log(`✓ Created user: ${userData.email}`)
      } catch (error) {
        console.error(`✗ Failed to create user ${userData.email}:`, (error as Error).message)
      }
    }

    console.log('Seeding complete!')
  }
}

3. SECONDARY ADAPTER - REPOSITORY (adapters/secondary/repositories/user.repository.ts):

import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/drizzle.config'
import { usersTable } from '../../../infrastructure/database/schema'
import { User } from '../../../domain/entities/user'
import { Email } from '../../../domain/value-objects/email'
import { Password } from '../../../domain/value-objects/password'
import { UserRepositoryPort } from '../../../application/ports/user.repository.port'

export class PostgresUserRepository implements UserRepositoryPort {
  async save(user: User): Promise<void> {
    await db.insert(usersTable).values({
      id: user.id,
      email: user.getEmail(),
      password: user['password'].getHash(), // Access private via bracket notation
      name: user.getName(),
      createdAt: new Date()
    })
  }

  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id))
    
    if (result.length === 0) {
      return null
    }

    return this.toDomain(result[0])
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email))
    
    if (result.length === 0) {
      return null
    }

    return this.toDomain(result[0])
  }

  async update(user: User): Promise<void> {
    await db.update(usersTable)
      .set({
        email: user.getEmail(),
        name: user.getName()
      })
      .where(eq(usersTable.id, user.id))
  }

  async delete(id: string): Promise<void> {
    await db.delete(usersTable).where(eq(usersTable.id, id))
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await db.select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
    
    return result.length > 0
  }

  private toDomain(record: any): User {
    const email = new Email(record.email)
    const password = Password.fromHash(record.password)
    return new User(record.id, email, password, record.name, record.createdAt)
  }
}

4. SECONDARY ADAPTER - EMAIL SERVICE (adapters/secondary/services/email.service.ts):

import { EmailServicePort } from '../../../application/ports/email.service.port'
import { LoggerPort } from '../../../application/ports/logger.port'

export class SendGridEmailService implements EmailServicePort {
  constructor(
    private readonly apiKey: string,
    private readonly logger: LoggerPort
  ) {}

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    this.logger.info('Sending welcome email', { to, name })
    
    // In real implementation, use SendGrid SDK
    const emailData = {
      to,
      from: 'noreply@gym.com',
      subject: 'Welcome to Level 2 Gym!',
      html: `<h1>Welcome ${name}!</h1><p>Thanks for joining our gym.</p>`
    }

    // await this.sendGridClient.send(emailData)
    this.logger.info('Welcome email sent', { to })
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    this.logger.info('Sending password reset email', { to })
    
    const emailData = {
      to,
      from: 'noreply@gym.com',
      subject: 'Reset Your Password',
      html: `<p>Click here to reset: <a href="https://gym.com/reset/${resetToken}">Reset Password</a></p>`
    }

    // await this.sendGridClient.send(emailData)
    this.logger.info('Password reset email sent', { to })
  }

  async sendWorkoutReminder(to: string, workoutDetails: any): Promise<void> {
    this.logger.info('Sending workout reminder', { to })
    
    const emailData = {
      to,
      from: 'noreply@gym.com',
      subject: 'Your Workout Reminder',
      html: `<p>Don't forget your workout today!</p>`
    }

    // await this.sendGridClient.send(emailData)
    this.logger.info('Workout reminder sent', { to })
  }
}

5. SECONDARY ADAPTER - LOGGER SERVICE (adapters/secondary/services/logger.service.ts):

import { LoggerPort } from '../../../application/ports/logger.port'
import pino from 'pino'

export class PinoLoggerService implements LoggerPort {
  private logger: pino.Logger

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      }
    })
  }

  info(message: string, context?: Record<string, any>): void {
    this.logger.info(context, message)
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.logger.error({ ...context, err: error }, message)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(context, message)
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(context, message)
  }
}
