import type { AIServicePort } from 'apps/backend/src/application/ports/ai.port.js'
import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/index.js'
import {
  chats,
  messages,
  parts,
  type DBMessageSelect,
  type MyDBUIMessagePartSelect,
} from '../../../infrastructure/database/schema.js'
import type { UIMessage } from 'ai'
import { Uuid7Util } from '../../../shared/utils/uuid7.util.js'

export type ChatResponseResult = {
  message: DBMessageSelect
  part: MyDBUIMessagePartSelect | null
}[]

export class AIRepository implements AIServicePort {
  async createChat(userId: string, initialMessages: UIMessage[] = []): Promise<string> {
    const chatId = Uuid7Util.createUuidv7()

    const newChat = {
      id: chatId,
      userId,
    }

    await db.insert(chats).values(newChat)

    // Insert initial messages if provided
    if (initialMessages.length > 0) {
      const messageRecords = initialMessages.map((msg) => ({
        chatId,
        role: msg.role,
      }))

      await db.insert(messages).values(messageRecords)
    }

    return chatId
  }
  async getChatResponse(chatId: string): Promise<ChatResponseResult | null> {
    try {
      // Query messages based on chatId and retrieve related parts
      const result = await db
        .select({
          message: messages,
          part: parts,
        })
        .from(messages)
        .leftJoin(parts, eq(parts.messageId, messages.id))
        .where(eq(messages.chatId, chatId))

      if (!result) {
        return null
      }

      return result
    } catch (error) {
      throw error
    }
  }
}
