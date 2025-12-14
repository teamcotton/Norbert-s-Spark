import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/index.js'
import { user } from '../../../infrastructure/database/schema.js'
import { User } from '../../../domain/entities/user.js'
import { Email } from '../../../domain/value-objects/email.js'
import { Password } from '../../../domain/value-objects/password.js'
import type { UserRepositoryPort } from '../../../application/ports/user.repository.port.js'

export class PostgresUserRepository implements UserRepositoryPort {
  async save(userEntity: User): Promise<void> {
    await db.insert(user).values({
      email: userEntity.getEmail(),
      password: userEntity['password'].getHash(), // Access private via bracket notation
      name: userEntity.getName(),
      createdAt: new Date()
    })
  }

  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(user).where(eq(user.userId, id))

    if (result.length === 0) {
      return null
    }

    return this.toDomain(result[0])
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(user).where(eq(user.email, email))

    if (result.length === 0) {
      return null
    }

    return this.toDomain(result[0])
  }

  async update(userEntity: User): Promise<void> {
    await db.update(user)
      .set({
        email: userEntity.getEmail(),
        name: userEntity.getName()
      })
      .where(eq(user.userId, user.userId))
  }

  async delete(id: string): Promise<void> {
    await db.delete(user).where(eq(user.userId, id))
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await db.select({ id: user.userId })
      .from(user)
      .where(eq(user.email, email))

    return result.length > 0
  }

  private toDomain(record: any): User {
    const email = new Email(record.email)
    const password = Password.fromHash(record.password)
    return new User(record.id, email, password, record.name, record.createdAt)
  }
}