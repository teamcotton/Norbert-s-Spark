import { Tiktoken } from 'js-tiktoken/lite'
import o200k_base from 'js-tiktoken/ranks/o200k_base'
import { readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Singleton class for tokenizing content using OpenAI's o200k_base tokenizer.
 *
 * @example
 * ```typescript
 * const tokenizer = TokeniseOpenAI.getInstance()
 *
 * // Tokenize content directly
 * const tokens1 = tokenizer.tokeniseContent('Hello, world!')
 *
 * // Tokenize file with full path and base directory validation
 * const tokens2 = tokenizer.tokeniseFile('/path/to/file.txt', '/allowed/base/dir')
 *
 * console.log(`Token count: ${tokens1.length}`)
 * ```
 */
class TokeniseOpenAI {
  private static instance: TokeniseOpenAI
  private tokenizer: Tiktoken

  private constructor() {
    this.tokenizer = new Tiktoken(o200k_base)
  }

  /**
   * Gets the singleton instance of TokeniseOpenAI.
   *
   * @returns The singleton instance
   */
  public static getInstance(): TokeniseOpenAI {
    if (!TokeniseOpenAI.instance) {
      TokeniseOpenAI.instance = new TokeniseOpenAI()
    }
    return TokeniseOpenAI.instance
  }

  /**
   * Tokenizes text content directly using OpenAI's o200k_base tokenizer.
   *
   * @param content - The text content to tokenize
   * @returns An array of token IDs
   * @throws {Error} If tokenization fails
   */
  public tokeniseContent(content: string): number[] {
    try {
      return this.tokenizer.encode(content)
    } catch (error) {
      throw new Error(
        `Failed to tokenize content: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Tokenizes the content of a file using OpenAI's o200k_base tokenizer.
   *
   * @param filePath - The absolute or relative file path
   * @param baseDir - Optional base directory to validate the file path against.
   *                  If provided, the resolved file path must be within this directory.
   * @returns An array of token IDs
   * @throws {Error} If the file cannot be read, path validation fails, or tokenization fails
   */
  public tokeniseFile(filePath: string, baseDir?: string): number[] {
    try {
      // Resolve to absolute path
      const resolvedPath = path.resolve(filePath)

      // If baseDir is provided, validate that the file is within the base directory
      if (baseDir) {
        const resolvedBaseDir = path.resolve(baseDir)

        // Ensure the resolved path starts with the base directory
        if (
          !resolvedPath.startsWith(resolvedBaseDir + path.sep) &&
          resolvedPath !== resolvedBaseDir
        ) {
          throw new Error(
            `File path "${filePath}" is outside the allowed base directory "${baseDir}"`
          )
        }
      }

      const input = readFileSync(resolvedPath, 'utf-8')
      return this.tokeniseContent(input)
    } catch (error) {
      // Re-throw if it's already our custom error
      if (error instanceof Error && error.message.includes('outside the allowed base directory')) {
        throw error
      }

      throw new Error(
        `Failed to tokenize file "${filePath}": ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

export { TokeniseOpenAI }
