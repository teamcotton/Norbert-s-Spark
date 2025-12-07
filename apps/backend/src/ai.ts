import { google } from '@ai-sdk/google'
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  stepCountIs,
  tool,
  type ModelMessage,
  type UIMessage,
} from 'ai'
import { z } from 'zod'
import { fileSystemTools } from './shared/utils/file.util.js'

export const POST = async (req: Request): Promise<Response> => {
  const body = (await req.json()) as { messages: UIMessage[] }

  const messages: UIMessage[] = body.messages

  const modelMessages: ModelMessage[] = convertToModelMessages(messages)

  const SYSTEM_PROMPT = `You must respond in the same style of Charles Marlow the narrator in Joseph Conrad's The Heart of Darkness novella.
`
  const streamTextResult = streamText({
    model: google(process.env.MODEL_PROVIDER || ''),
    messages: modelMessages,
    system: ` ${SYSTEM_PROMPT}
      You are a helpful assistant that can use a sandboxed file system to create, edit and delete files.

      You have access to the following tools:
      - writeFile
      - readFile
      - deletePath
      - listDirectory
      - createDirectory
      - exists
      - searchFiles

      Use these tools to record notes, create todo lists, and edit documents for the user.

      Use markdown files to store information.
    `,
    tools: {
      writeFile: tool({
        description: 'Write to a file',
        inputSchema: z.object({
          path: z.string().describe('The path to the file to create'),
          content: z.string().describe('The content of the file to create'),
        }),
        execute: async ({ path, content }) => {
          return fileSystemTools.writeFile(path, content)
        },
      }),
      readFile: tool({
        description: 'Read a file',
        inputSchema: z.object({
          path: z.string().describe('The path to the file to read'),
        }),
        execute: async ({ path }) => {
          return fileSystemTools.readFile(path)
        },
      }),
      deletePath: tool({
        description: 'Delete a file or directory',
        inputSchema: z.object({
          path: z.string().describe('The path to the file or directory to delete'),
        }),
        execute: async ({ path }) => {
          return fileSystemTools.deletePath(path)
        },
      }),
      listDirectory: tool({
        description: 'List a directory',
        inputSchema: z.object({
          path: z.string().describe('The path to the directory to list'),
        }),
        execute: async ({ path }) => {
          return fileSystemTools.listDirectory(path)
        },
      }),
      createDirectory: tool({
        description: 'Create a directory',
        inputSchema: z.object({
          path: z.string().describe('The path to the directory to create'),
        }),
        execute: async ({ path }) => {
          return fileSystemTools.createDirectory(path)
        },
      }),
      exists: tool({
        description: 'Check if a file or directory exists',
        inputSchema: z.object({
          path: z.string().describe('The path to the file or directory to check'),
        }),
        execute: async ({ path }) => {
          return fileSystemTools.exists(path)
        },
      }),
      searchFiles: tool({
        description: 'Search for files',
        inputSchema: z.object({
          pattern: z.string().describe('The pattern to search for'),
        }),
        execute: async ({ pattern }) => {
          return fileSystemTools.searchFiles(pattern)
        },
      }),
    },
    stopWhen: [stepCountIs(10)],
    onChunk({ chunk }) {
      // Called for each partial piece of output
      if (chunk.type === 'text-delta') {
        process.stdout.write(chunk.text)
        // (Debugging) To log chunk text, use console.log or a logger. For production, do not output to stdout.
      }
      // you can also inspect chunk.reasoning / chunk.sources / etc.
    },
    onFinish({ text, finishReason, usage, response, totalUsage }) {
      // Called once when the full output is complete
      console.log('\n--- DONE ---')
      console.log('Full text:', text)
      console.log('Finish reason:', finishReason)
      console.log('Usage info:', usage, totalUsage)
      // use proper logging for production
      // response.messages contains the final message object(s)
    },
    onError({ error }) {
      // use proper logging for production
      console.error('Stream error:', error)
    },
  })

  const stream = streamTextResult.toUIMessageStream()

  return createUIMessageStreamResponse({
    stream,
  })
}
