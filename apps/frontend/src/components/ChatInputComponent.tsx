import React from 'react'

export const ChatInput = ({
  input,
  onChange,
  onSubmit,
}: {
  input: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
}) => (
  <form onSubmit={onSubmit}>
    <input
      className="fixed bottom-0 w-full max-w-md p-2 mb-8 border-2 border-zinc-700 rounded shadow-xl bg-gray-800"
      value={input}
      placeholder="Say something..."
      onChange={onChange}
    />
  </form>
)
