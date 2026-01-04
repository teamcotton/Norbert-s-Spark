import { db } from '../../../infrastructure/database/index.js'
import { auditLog } from '../../../infrastructure/database/schema.js'
import type { AuditLogPort, CreateAuditLogDTO } from '../../../application/ports/audit-log.port.js'
import { eq, desc, and } from 'drizzle-orm'
import type { LoggerPort } from '../../../application/ports/logger.port.js'
import { AuditLog } from '../../../domain/audit/audit-log.entity.js'
import { EntityType, AuditAction } from '../../../domain/audit/entity-type.enum.js'

export class AuditLogRepository implements AuditLogPort {
  constructor(private readonly logger: LoggerPort) {}

  async log(entry: CreateAuditLogDTO): Promise<void> {
    try {
      await db.insert(auditLog).values({
        userId: entry.userId,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        changes: entry.changes ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      })

      this.logger.info('Audit log entry created', {
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
      })
    } catch (error) {
      this.logger.error('Failed to create audit log entry', error as Error, { entry })
      // Don't throw - audit logging should not break business operations
    }
  }

  async getByEntity(entityType: EntityType, entityId: string): Promise<AuditLog[]> {
    const results = await db
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.entityType, entityType), eq(auditLog.entityId, entityId)))
      .orderBy(desc(auditLog.createdAt))

    return results.map(this.mapToEntity)
  }

  async getByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const results = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.userId, userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)

    return results.map(this.mapToEntity)
  }

  async getByAction(action: AuditAction, limit: number = 100): Promise<AuditLog[]> {
    const results = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.action, action))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)

    return results.map(this.mapToEntity)
  }

  private mapToEntity(row: any): AuditLog {
    return new AuditLog(
      row.id,
      row.userId,
      row.entityType,
      row.entityId,
      row.action,
      row.changes,
      row.ipAddress,
      row.userAgent,
      row.createdAt
    )
  }
}
