import { z } from 'zod'

export const AISchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'AI name is required' }),
  description: z.string().optional(),
  model: z.string().min(1, { message: 'Model is required' }),
  temperature: z
    .number()
    .min(0, { message: 'Temperature must be at least 0' })
    .max(1, { message: 'Temperature must be at most 1' }),
  topP: z
    .number()
    .min(0, { message: 'topP must be at least 0' })
    .max(1, { message: 'topP must be at most 1' }),
  maxTokens: z.number().min(1, { message: 'maxTokens must be at least 1' }),
  createdAt: z.string().optional(),
})

export const CreateAISchema = AISchema.pick({
  name: true,
  description: true,
  model: true,
  temperature: true,
  topP: true,
  maxTokens: true,
})

export const UpdateAISchema = CreateAISchema.partial()

export const AISummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  model: z.string(),
  createdAt: z.string().optional(),
})

export const AIListSchema = z.array(AISummarySchema)

export const AISummaryWithUsageSchema = AISummarySchema.extend({
  usageCount: z.number(),
})

export const AIListWithUsageSchema = z.array(AISummaryWithUsageSchema)
export const AIUsageSchema = z.object({
  aiId: z.string(),
  usageCount: z.number(),
})

export const AIUsageListSchema = z.array(AIUsageSchema)

export const AIModelsSchema = z.array(z.string())

export const AIRequestSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt is required' }),
})

const MessagePartSchema = z.object({
  type: z.enum(['text', 'step-start']),
  text: z.string().optional(),
  state: z.enum(['done']).optional(),
})

const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  parts: z.array(MessagePartSchema),
})

export const AIReturnedResponse = z.object({
  id: z.uuid(),
  messages: z.array(MessageSchema),
  trigger: z.string(),
})

export type AISchemaType = z.infer<typeof AISchema>
export type CreateAISchemaType = z.infer<typeof CreateAISchema>
export type UpdateAISchemaType = z.infer<typeof UpdateAISchema>
export type AISummarySchemaType = z.infer<typeof AISummarySchema>
export type AIListSchemaType = z.infer<typeof AIListSchema>
export type AIUsageSchemaType = z.infer<typeof AIUsageSchema>
export type AIUsageListSchemaType = z.infer<typeof AIUsageListSchema>
export type AIReturnedResponseType = z.infer<typeof AIReturnedResponse>
