import type { AIServicePort } from '../ports/ai.port.js'
import type { LoggerPort } from '../ports/logger.port.js'
import type { ChatIdType } from '../../domain/value-objects/chatID.js'

//TODO: use an existing use case like GetChatUseCase and delete this
export class GetChatContentByChatIdUseCase {
  constructor(
    private readonly aiService: AIServicePort,
    private readonly logger: LoggerPort
  ) {}
  async execute(chatId: ChatIdType) {
    this.logger.info('GetChatContentByChatIdUseCase.execute', chatId)
    const chatContent = await this.aiService.getAIChatByChatId(chatId)
    return chatContent
  }
}
