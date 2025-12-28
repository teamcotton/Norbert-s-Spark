import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  createdAt: z.coerce.date(),
})

export const PublicUserSchema = UserSchema.pick({ id: true, name: true, email: true })
