import type { LoggerPort } from '../ports/logger.port.js'
import type { UIMessage } from 'ai'
import { AIRepository } from '../../adapters/secondary/repositories/ai.repository.js'
//userRepository

export interface CreateChatResult {
  chatId: string
  initialMessages: UIMessage[]
}

export class CreateChatUseCase {
  constructor(
    private readonly logger: LoggerPort,
    private readonly aiRepository: AIRepository
  ) {}
  //(id: string, initialMessages: UIMessage[] = []
  async execute(userId: string, messages: UIMessage[] = []): Promise<CreateChatResult> {
    this.logger.info('Appending chat messages', { userId, messageCount: messages.length })

    const chatId = await this.aiRepository.createChat(userId, messages)

    // This is a placeholder return value
    return {
      chatId,
      initialMessages: messages,
    }
  }
}
