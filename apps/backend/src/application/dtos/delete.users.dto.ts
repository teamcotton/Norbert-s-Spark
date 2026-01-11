import { TypeException } from '../../shared/exceptions/type.exception.js'
import { Uuid7Util } from '../../shared/utils/uuid7.util.js'
import type { UUIDType } from '../../domain/value-objects/uuid.js'

export class DeleteUsersDto {
  constructor(public readonly userIds: UUIDType[]) {}

  static validate(data: any): DeleteUsersDto {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new TypeException('Data must be a valid array of user IDs')
    }

    if (!Array.isArray(data.userIds) || !data.userIds.every((id: any) => typeof id === 'string')) {
      throw new TypeException('userIds must be an array of strings')
    }

    // use Uuid7Util to validate that each userId is a valid UUIDv7
    for (const id of data.userIds) {
      const version = Uuid7Util.uuidVersionValidation(id)
      if (version !== 'v7') {
        throw new TypeException(`Invalid UUIDv7 format for userId: ${id}`)
      }
    }

    return new DeleteUsersDto(data.userIds)
  }
}
