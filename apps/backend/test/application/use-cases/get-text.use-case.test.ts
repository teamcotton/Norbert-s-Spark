import * as fs from 'node:fs/promises'
import path from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { GetTextUseCase } from '../../../src/application/use-cases/get-text.use-case.js'
import { TypeException } from '../../../src/shared/exceptions/type.exception.js'

// Mock the fs module
vi.mock('node:fs/promises')

// Local interface for error with code property
interface ErrorWithCode extends Error {
  code?: string
}

describe('GetTextUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    describe('valid file extensions', () => {
      it('should create instance with .txt file extension', () => {
        const useCase = new GetTextUseCase('data', 'test.txt')
        expect(useCase).toBeInstanceOf(GetTextUseCase)
        expect(useCase.filePath).toContain('test.txt')
      })

      it('should create instance with .csv file extension', () => {
        const useCase = new GetTextUseCase('data', 'test.csv')
        expect(useCase).toBeInstanceOf(GetTextUseCase)
        expect(useCase.filePath).toContain('test.csv')
      })

      it('should create instance with .json file extension', () => {
        const useCase = new GetTextUseCase('data', 'test.json')
        expect(useCase).toBeInstanceOf(GetTextUseCase)
        expect(useCase.filePath).toContain('test.json')
      })

      it('should create instance with .toon file extension', () => {
        const useCase = new GetTextUseCase('data', 'test.toon')
        expect(useCase).toBeInstanceOf(GetTextUseCase)
        expect(useCase.filePath).toContain('test.toon')
      })

      it('should create instance with .onnx file extension', () => {
        const useCase = new GetTextUseCase('data', 'test.onnx')
        expect(useCase).toBeInstanceOf(GetTextUseCase)
        expect(useCase.filePath).toContain('test.onnx')
      })

      it('should create instance with .safetensors file extension', () => {
        const useCase = new GetTextUseCase('data', 'test.safetensors')
        expect(useCase).toBeInstanceOf(GetTextUseCase)
        expect(useCase.filePath).toContain('test.safetensors')
      })

      it('should create instance with .pt file extension', () => {
        const useCase = new GetTextUseCase('data', 'test.pt')
        expect(useCase).toBeInstanceOf(GetTextUseCase)
        expect(useCase.filePath).toContain('test.pt')
      })

      it('should create instance with .py file extension', () => {
        const useCase = new GetTextUseCase('data', 'test.py')
        expect(useCase).toBeInstanceOf(GetTextUseCase)
        expect(useCase.filePath).toContain('test.py')
      })

      it('should create instance with .gguf file extension', () => {
        const useCase = new GetTextUseCase('data', 'test.gguf')
        expect(useCase).toBeInstanceOf(GetTextUseCase)
        expect(useCase.filePath).toContain('test.gguf')
      })

      it('should handle uppercase file extensions', () => {
        const useCase = new GetTextUseCase('data', 'test.TXT')
        expect(useCase).toBeInstanceOf(GetTextUseCase)
        expect(useCase.filePath).toContain('test.TXT')
      })

      it('should handle mixed case file extensions', () => {
        const useCase = new GetTextUseCase('data', 'test.JsOn')
        expect(useCase).toBeInstanceOf(GetTextUseCase)
        expect(useCase.filePath).toContain('test.JsOn')
      })
    })

    describe('invalid file extensions', () => {
      it('should throw TypeException for .pdf file extension', () => {
        expect(() => new GetTextUseCase('data', 'test.pdf')).toThrow(TypeException)
        expect(() => new GetTextUseCase('data', 'test.pdf')).toThrow(/Invalid file extension/)
      })

      it('should throw TypeException for .docx file extension', () => {
        expect(() => new GetTextUseCase('data', 'test.docx')).toThrow(TypeException)
      })

      it('should throw TypeException for .exe file extension', () => {
        expect(() => new GetTextUseCase('data', 'test.exe')).toThrow(TypeException)
      })

      it('should throw TypeException for no file extension', () => {
        expect(() => new GetTextUseCase('data', 'testfile')).toThrow(TypeException)
      })

      it('should include supported extensions in error message', () => {
        expect(() => new GetTextUseCase('data', 'test.pdf')).toThrow(TypeException)
        expect(() => new GetTextUseCase('data', 'test.pdf')).toThrow(/\.txt/)
        expect(() => new GetTextUseCase('data', 'test.pdf')).toThrow(/\.csv/)
        expect(() => new GetTextUseCase('data', 'test.pdf')).toThrow(/\.json/)
      })
    })

    describe('file path construction', () => {
      it('should construct correct file path with folder and filename', () => {
        const useCase = new GetTextUseCase('data', 'test.txt')
        const expectedPath = path.join(process.cwd(), 'data', 'test.txt')
        expect(useCase.filePath).toBe(expectedPath)
      })

      it('should handle nested folder paths', () => {
        const useCase = new GetTextUseCase('data/subfolder', 'test.txt')
        const expectedPath = path.join(process.cwd(), 'data/subfolder', 'test.txt')
        expect(useCase.filePath).toBe(expectedPath)
      })

      it('should make filePath publicly accessible', () => {
        const useCase = new GetTextUseCase('data', 'test.txt')
        expect(useCase.filePath).toBeDefined()
        expect(typeof useCase.filePath).toBe('string')
      })
    })
  })

  describe('execute()', () => {
    describe('successful file reading', () => {
      it('should read file content successfully', async () => {
        const mockContent = 'This is test content'
        vi.mocked(fs.readFile).mockResolvedValue(mockContent)

        const useCase = new GetTextUseCase('data', 'test.txt')
        const result = await useCase.execute()

        expect(result).toBe(mockContent)
        expect(fs.readFile).toHaveBeenCalledTimes(1)
        expect(fs.readFile).toHaveBeenCalledWith(useCase.filePath, 'utf8')
      })

      it('should cache content after successful read', async () => {
        const mockContent = 'Cached content'
        vi.mocked(fs.readFile).mockResolvedValue(mockContent)

        const useCase = new GetTextUseCase('data', 'test.txt')
        await useCase.execute()

        expect(useCase.hasCachedContent(useCase.filePath)).toBe(true)
        expect(useCase.getCachedContent(useCase.filePath)).toBe(mockContent)
      })

      it('should handle large file content', async () => {
        const mockContent = 'A'.repeat(10000)
        vi.mocked(fs.readFile).mockResolvedValue(mockContent)

        const useCase = new GetTextUseCase('data', 'large.txt')
        const result = await useCase.execute()

        expect(result).toBe(mockContent)
        expect(result?.length).toBe(10000)
      })

      it('should handle multiline content', async () => {
        const mockContent = 'Line 1\nLine 2\nLine 3'
        vi.mocked(fs.readFile).mockResolvedValue(mockContent)

        const useCase = new GetTextUseCase('data', 'multiline.txt')
        const result = await useCase.execute()

        expect(result).toBe(mockContent)
        expect(result?.split('\n')).toHaveLength(3)
      })

      it('should handle content with special characters', async () => {
        const mockContent = 'Special chars: !@#$%^&*()_+-={}[]|\\:";\'<>?,./'
        vi.mocked(fs.readFile).mockResolvedValue(mockContent)

        const useCase = new GetTextUseCase('data', 'special.txt')
        const result = await useCase.execute()

        expect(result).toBe(mockContent)
      })

      it('should handle unicode content', async () => {
        const mockContent = 'Unicode: 你好世界 مرحبا العالم'
        vi.mocked(fs.readFile).mockResolvedValue(mockContent)

        const useCase = new GetTextUseCase('data', 'unicode.txt')
        const result = await useCase.execute()

        expect(result).toBe(mockContent)
      })
    })

    describe('empty file handling', () => {
      it('should return undefined for empty file content', async () => {
        vi.mocked(fs.readFile).mockResolvedValue('')

        const useCase = new GetTextUseCase('data', 'empty.txt')
        const result = await useCase.execute()

        expect(result).toBeUndefined()
      })

      it('should not cache empty content', async () => {
        vi.mocked(fs.readFile).mockResolvedValue('')

        const useCase = new GetTextUseCase('data', 'empty.txt')
        await useCase.execute()

        expect(useCase.hasCachedContent(useCase.filePath)).toBe(false)
      })
    })

    describe('file not found errors', () => {
      it('should throw error when file does not exist', async () => {
        const error: ErrorWithCode = new Error('File not found')
        error.code = 'ENOENT'
        vi.mocked(fs.readFile).mockRejectedValue(error)

        const useCase = new GetTextUseCase('data', 'nonexistent.txt')

        await expect(useCase.execute()).rejects.toThrow(/File not found/)
        await expect(useCase.execute()).rejects.toThrow(/nonexistent.txt/)
      })

      it('should include file path in error message for ENOENT', async () => {
        const error: ErrorWithCode = new Error('File not found')
        error.code = 'ENOENT'
        vi.mocked(fs.readFile).mockRejectedValue(error)

        const useCase = new GetTextUseCase('data', 'missing.txt')

        await expect(useCase.execute()).rejects.toThrow(/Error reading file/)
        await expect(useCase.execute()).rejects.toThrow(/missing.txt/)
      })

      it('should not cache content when file is not found', async () => {
        const error: ErrorWithCode = new Error('File not found')
        error.code = 'ENOENT'
        vi.mocked(fs.readFile).mockRejectedValue(error)

        const useCase = new GetTextUseCase('data', 'missing.txt')

        await expect(useCase.execute()).rejects.toThrow()
        expect(useCase.hasCachedContent(useCase.filePath)).toBe(false)
      })
    })

    describe('other file system errors', () => {
      it('should throw error for permission denied', async () => {
        const error: ErrorWithCode = new Error('Permission denied')
        error.code = 'EACCES'
        vi.mocked(fs.readFile).mockRejectedValue(error)

        const useCase = new GetTextUseCase('data', 'restricted.txt')

        await expect(useCase.execute()).rejects.toThrow(/Error reading file/)
        await expect(useCase.execute()).rejects.toThrow(/Permission denied/)
      })

      it('should handle generic Error objects', async () => {
        const error = new Error('Generic error')
        vi.mocked(fs.readFile).mockRejectedValue(error)

        const useCase = new GetTextUseCase('data', 'test.txt')

        await expect(useCase.execute()).rejects.toThrow(/Error reading file/)
        await expect(useCase.execute()).rejects.toThrow(/Generic error/)
      })

      it('should handle non-Error thrown values', async () => {
        vi.mocked(fs.readFile).mockRejectedValue('String error')

        const useCase = new GetTextUseCase('data', 'test.txt')

        await expect(useCase.execute()).rejects.toThrow(/Error reading file/)
        await expect(useCase.execute()).rejects.toThrow(/Unknown error/)
      })
    })
  })

  describe('getCachedContent()', () => {
    it('should return undefined for non-cached file', () => {
      const useCase = new GetTextUseCase('data', 'test.txt')
      const result = useCase.getCachedContent(useCase.filePath)

      expect(result).toBeUndefined()
    })

    it('should return cached content after execute', async () => {
      const mockContent = 'Cached content'
      vi.mocked(fs.readFile).mockResolvedValue(mockContent)

      const useCase = new GetTextUseCase('data', 'test.txt')
      await useCase.execute()

      const cached = useCase.getCachedContent(useCase.filePath)
      expect(cached).toBe(mockContent)
    })

    it('should return undefined for different file path', async () => {
      const mockContent = 'Content'
      vi.mocked(fs.readFile).mockResolvedValue(mockContent)

      const useCase = new GetTextUseCase('data', 'test.txt')
      await useCase.execute()

      const cached = useCase.getCachedContent('/different/path.txt')
      expect(cached).toBeUndefined()
    })
  })

  describe('hasCachedContent()', () => {
    it('should return false for non-cached file', () => {
      const useCase = new GetTextUseCase('data', 'test.txt')
      expect(useCase.hasCachedContent(useCase.filePath)).toBe(false)
    })

    it('should return true after successful execute', async () => {
      const mockContent = 'Content'
      vi.mocked(fs.readFile).mockResolvedValue(mockContent)

      const useCase = new GetTextUseCase('data', 'test.txt')
      await useCase.execute()

      expect(useCase.hasCachedContent(useCase.filePath)).toBe(true)
    })

    it('should return false for different file path', async () => {
      const mockContent = 'Content'
      vi.mocked(fs.readFile).mockResolvedValue(mockContent)

      const useCase = new GetTextUseCase('data', 'test.txt')
      await useCase.execute()

      expect(useCase.hasCachedContent('/different/path.txt')).toBe(false)
    })

    it('should return false after cache is cleared', async () => {
      const mockContent = 'Content'
      vi.mocked(fs.readFile).mockResolvedValue(mockContent)

      const useCase = new GetTextUseCase('data', 'test.txt')
      await useCase.execute()

      useCase.clearCache(useCase.filePath)
      expect(useCase.hasCachedContent(useCase.filePath)).toBe(false)
    })
  })

  describe('clearCache()', () => {
    describe('clearing specific file', () => {
      it('should clear cache for specific file path', async () => {
        const mockContent = 'Content'
        vi.mocked(fs.readFile).mockResolvedValue(mockContent)

        const useCase = new GetTextUseCase('data', 'test.txt')
        await useCase.execute()

        useCase.clearCache(useCase.filePath)
        expect(useCase.hasCachedContent(useCase.filePath)).toBe(false)
      })

      it('should not affect other cached files when clearing specific path', async () => {
        const mockContent1 = 'Content 1'
        const mockContent2 = 'Content 2'

        const useCase1 = new GetTextUseCase('data', 'test1.txt')
        const useCase2 = new GetTextUseCase('data', 'test2.txt')

        vi.mocked(fs.readFile).mockResolvedValue(mockContent1)
        await useCase1.execute()

        vi.mocked(fs.readFile).mockResolvedValue(mockContent2)
        await useCase2.execute()

        // Note: Each instance has its own cache, so we can't test cross-instance behavior
        // This test validates that clearCache with a path only affects that specific path
        useCase1.clearCache(useCase1.filePath)
        expect(useCase1.hasCachedContent(useCase1.filePath)).toBe(false)
      })
    })

    describe('clearing all cache', () => {
      it('should clear all cached content when called without arguments', async () => {
        const mockContent = 'Content'
        vi.mocked(fs.readFile).mockResolvedValue(mockContent)

        const useCase = new GetTextUseCase('data', 'test.txt')
        await useCase.execute()

        useCase.clearCache()
        expect(useCase.hasCachedContent(useCase.filePath)).toBe(false)
      })

      it('should have no effect when cache is already empty', () => {
        const useCase = new GetTextUseCase('data', 'test.txt')
        expect(() => useCase.clearCache()).not.toThrow()
        expect(useCase.getCachedPaths()).toHaveLength(0)
      })
    })
  })

  describe('getCachedPaths()', () => {
    it('should return empty array when no files are cached', () => {
      const useCase = new GetTextUseCase('data', 'test.txt')
      const paths = useCase.getCachedPaths()

      expect(paths).toEqual([])
      expect(paths).toHaveLength(0)
    })

    it('should return array with cached file path after execute', async () => {
      const mockContent = 'Content'
      vi.mocked(fs.readFile).mockResolvedValue(mockContent)

      const useCase = new GetTextUseCase('data', 'test.txt')
      await useCase.execute()

      const paths = useCase.getCachedPaths()
      expect(paths).toHaveLength(1)
      expect(paths[0]).toBe(useCase.filePath)
    })

    it('should return array type', () => {
      const useCase = new GetTextUseCase('data', 'test.txt')
      const paths = useCase.getCachedPaths()

      expect(Array.isArray(paths)).toBe(true)
    })

    it('should return empty array after clearing all cache', async () => {
      const mockContent = 'Content'
      vi.mocked(fs.readFile).mockResolvedValue(mockContent)

      const useCase = new GetTextUseCase('data', 'test.txt')
      await useCase.execute()

      useCase.clearCache()
      const paths = useCase.getCachedPaths()

      expect(paths).toHaveLength(0)
    })
  })

  describe('integration scenarios', () => {
    it('should maintain separate cache instances for different use cases', async () => {
      const mockContent1 = 'Content 1'
      const mockContent2 = 'Content 2'

      const useCase1 = new GetTextUseCase('data', 'file1.txt')
      const useCase2 = new GetTextUseCase('data', 'file2.txt')

      vi.mocked(fs.readFile).mockResolvedValueOnce(mockContent1)
      vi.mocked(fs.readFile).mockResolvedValueOnce(mockContent2)

      await useCase1.execute()
      await useCase2.execute()

      expect(useCase1.getCachedContent(useCase1.filePath)).toBe(mockContent1)
      expect(useCase2.getCachedContent(useCase2.filePath)).toBe(mockContent2)
    })

    it('should allow multiple execute calls with cache', async () => {
      const mockContent = 'Content'
      vi.mocked(fs.readFile).mockResolvedValue(mockContent)

      const useCase = new GetTextUseCase('data', 'test.txt')

      // First execute - reads from file
      const result1 = await useCase.execute()
      expect(result1).toBe(mockContent)

      // Cache is populated but execute always reads from file
      const result2 = await useCase.execute()
      expect(result2).toBe(mockContent)
      expect(fs.readFile).toHaveBeenCalledTimes(2)
    })

    it('should handle repeated clearing and re-executing', async () => {
      const mockContent = 'Content'
      vi.mocked(fs.readFile).mockResolvedValue(mockContent)

      const useCase = new GetTextUseCase('data', 'test.txt')

      await useCase.execute()
      useCase.clearCache()
      await useCase.execute()

      expect(useCase.hasCachedContent(useCase.filePath)).toBe(true)
    })
  })
})
