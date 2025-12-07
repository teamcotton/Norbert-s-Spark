import { google } from '@ai-sdk/google'
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  type ModelMessage,
  type UIMessage,
} from 'ai'

export const POST = async (req: Request): Promise<Response> => {
  const body = (await req.json()) as { messages: UIMessage[] }

  const messages: UIMessage[] = body.messages

  const modelMessages: ModelMessage[] = convertToModelMessages(messages)

  const streamTextResult = streamText({
    model: google(process.env.MODEL_PROVIDER || ''),
    messages: modelMessages,
  })

  const stream = streamTextResult.toUIMessageStream()

  return createUIMessageStreamResponse({
    stream,
  })
}
