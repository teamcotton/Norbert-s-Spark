import type { LoggerPort } from '../ports/logger.port.js'
import type { UserRepositoryPort } from '../ports/user.repository.port.js'
import type { UserIdType } from '../../domain/value-objects/userID.js'
import type { AuditLogPort } from '../ports/audit-log.port.js'

export class DeleteUsersUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly logger: LoggerPort,
    private readonly auditLog: AuditLogPort
  ) {}

  async execute(userIds: UserIdType[]): Promise<void> {
    this.logger.info('Deleting users', { userIds })
    await this.userRepository.deleteUsers(userIds)
  }
}
