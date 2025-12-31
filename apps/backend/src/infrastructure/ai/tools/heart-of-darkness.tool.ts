import { tool, type InferToolInput, type InferToolOutput } from 'ai'
import { z } from 'zod'
import { GetTextUseCase } from '../../../application/use-cases/get-text.use-case.js'
import type { LoggerPort } from '../../../application/ports/logger.port.js'

/**
 * AI tool for answering questions about Joseph Conrad's "Heart of Darkness"
 *
 * Provides access to the full text of the novella with caching for performance.
 *
 * @class
 *
 * @example
 * ```typescript
 * const logger = new ConsoleLogger()
 * const heartOfDarknessTool = new HeartOfDarkness(logger)
 * const tool = heartOfDarknessTool.getTool()
 * ```
 */
export class HeartOfDarknessTool {
  private readonly getTextUseCase: GetTextUseCase
  private readonly logger: LoggerPort

  constructor(logger: LoggerPort) {
    this.logger = logger
    this.getTextUseCase = new GetTextUseCase('data', 'heart-of-darkness.txt')
  }

  /**
   * Get the AI tool definition
   *
   * @returns The configured AI tool
   */
  public getTool() {
    return tool({
      description:
        'Answer questions about Joseph Conrad\'s novella "Heart of Darkness" using the full text of the book',
      inputSchema: z.object({
        question: z.string().describe('The question to answer about Heart of Darkness'),
      }),
      execute: async ({ question }) => {
        try {
          // Read the Heart of Darkness text file using the use case instance
          const filePath = this.getTextUseCase.filePath

          let heartOfDarknessText

          if (this.getTextUseCase.hasCachedContent(filePath)) {
            heartOfDarknessText = this.getTextUseCase.getCachedContent(filePath)
            this.logger.info('Heart of Darkness text loaded from cache')
          } else {
            heartOfDarknessText = await this.getTextUseCase.execute()
            this.logger.info('Heart of Darkness text loaded from file')
          }

          // Return the full text as context for the AI to use in answering
          return {
            question,
            textLength: heartOfDarknessText ? heartOfDarknessText.length : 0,
            context: heartOfDarknessText,
            instructions:
              'Use the provided full text of Heart of Darkness to answer the question comprehensively and accurately. Reference specific passages where relevant.',
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          this.logger.error(`Error loading Heart of Darkness text: ${errorMessage}`)
          throw new Error(`Error loading Heart of Darkness text: ${errorMessage}`)
        }
      },
    })
  }
}

export type HeartOfDarknessInput = InferToolInput<ReturnType<HeartOfDarknessTool['getTool']>>
export type HeartOfDarknessOutput = InferToolOutput<ReturnType<HeartOfDarknessTool['getTool']>>
