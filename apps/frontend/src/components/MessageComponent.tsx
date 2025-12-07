import type { UIDataTypes, UIMessagePart, UITools } from 'ai'
import { Streamdown } from 'streamdown'

export const Message = ({
  parts,
  role,
}: {
  role: string
  parts: UIMessagePart<UIDataTypes, UITools>[]
}) => {
  const prefix = role === 'user' ? 'User: ' : 'AI: '

  const text = parts
    .map((part) => {
      if (part.type === 'text') {
        return part.text
      }
      return ''
    })
    .join('')
  return (
    <div className="prose prose-invert my-6">
      <Streamdown>{prefix + text}</Streamdown>
    </div>
  )
}
