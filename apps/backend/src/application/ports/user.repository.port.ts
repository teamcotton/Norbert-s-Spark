import type { User } from '../../domain/entities/user.js'
import type { UserIdType } from '../../domain/value-objects/userID.js'

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}

export interface UserRepositoryPort {
  save(user: User): Promise<UserIdType>
  findAll(params?: PaginationParams): Promise<PaginatedResult<User>>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  update(user: User): Promise<void>
  delete(id: string): Promise<void>
  existsByEmail(email: string): Promise<boolean>
  saveProvider(user: User): Promise<{ userId: UserIdType; isNewUser: boolean }>
}
