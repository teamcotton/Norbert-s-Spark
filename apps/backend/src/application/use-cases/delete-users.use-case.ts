import type { LoggerPort } from '../ports/logger.port.js'
import type { UserRepositoryPort } from '../ports/user.repository.port.js'
import type { UserIdType } from '../../domain/value-objects/userID.js'
import type { AuditLogPort } from '../ports/audit-log.port.js'
import { AuditAction, EntityType } from '../../domain/audit/entity-type.enum.js'

export class DeleteUsersUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly logger: LoggerPort,
    private readonly auditLog: AuditLogPort
  ) {}

  async execute(
    userIds: UserIdType[],
    auditContext: { ipAddress: string; userAgent: string | null }
  ): Promise<boolean> {
    this.logger.info('Deleting users', { userIds })

    try {
      await this.userRepository.deleteUsers(userIds)
    } catch (error) {
      this.logger.error('Error deleting users', error as Error, { userIds })
      throw error
    }

    try {
      await this.auditLog.log({
        userId: null,
        entityType: EntityType.USER,
        entityId: userIds.join(','),
        action: AuditAction.DELETE,
        changes: { reason: 'deleted_users' },
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent ?? undefined,
      })
    } catch (error) {
      this.logger.error('Error logging audit for user deletion', error as Error, { userIds })
    }

    return true
  }
}
