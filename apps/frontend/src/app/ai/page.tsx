'use client'
import PersonIcon from '@mui/icons-material/Person'
import SendIcon from '@mui/icons-material/Send'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'

import { Wrapper } from '@/components/WrapperComponent.js'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('https://127.0.0.1:3001/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const data = JSON.parse(line.slice(2)) as { content?: string }
                if (data.content) {
                  assistantMessage += data.content
                  setMessages((prev) => {
                    const newMessages = [...prev]
                    const lastMessage = newMessages[newMessages.length - 1]
                    if (lastMessage?.role === 'assistant') {
                      lastMessage.content = assistantMessage
                    } else {
                      newMessages.push({ role: 'assistant', content: assistantMessage })
                    }
                    return newMessages
                  })
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Wrapper>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        AI Chat Assistant
      </Typography>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          mb: 2,
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: 'grey.50',
          }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Start a conversation by typing a message below
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                    }}
                  >
                    {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                  </Avatar>
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.role === 'user' ? 'primary.light' : 'white',
                      color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              {isLoading && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <SmartToyIcon />
                  </Avatar>
                  <CircularProgress size={24} />
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Stack>
          )}
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              variant="outlined"
              size="small"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={!input.trim() || isLoading}
              sx={{ alignSelf: 'flex-end' }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Paper>
    </Wrapper>
  )
}
