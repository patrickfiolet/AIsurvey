'use client'

/**
 * Conversational Survey Interface — v2.0
 * Chat-style interface with real-time entity extraction and progress tracking.
 */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  content: string
  entities?: Array<{ type: string; value: string; confidence: number }>
}

interface ConversationalInterfaceProps {
  surveyId: string
  respondentName: string
  language: string
}

export function ConversationalInterface({
  surveyId,
  respondentName,
  language,
}: ConversationalInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [allEntities, setAllEntities] = useState<Array<{ type: string; value: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start conversation on mount
  useEffect(() => {
    startConversation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startConversation() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          surveyId,
          respondentName,
          language,
        }),
      })
      const data = await res.json()
      setConversationId(data.conversationId)
      setMessages([{ role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Failed to start conversation:', error)
      setMessages([{ role: 'assistant', content: 'Sorry, er is een fout opgetreden. Probeer het opnieuw.' }])
    } finally {
      setIsLoading(false)
    }
  }

  async function sendMessage() {
    if (!input.trim() || !conversationId || isLoading || isCompleted) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond',
          conversationId,
          message: userMessage,
        }),
      })
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message, entities: data.entities },
      ])
      setProgress(data.progress || 0)
      setIsCompleted(data.isCompleted || false)

      if (data.entities?.length > 0) {
        setAllEntities((prev) => [
          ...prev,
          ...data.entities.map((e: any) => ({ type: e.type, value: e.value })),
        ])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, er is een fout opgetreden.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Assessment</h1>
            <p className="text-sm text-gray-500">
              {respondentName} — {language.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">{progress}%</div>
              <div className="h-2 w-24 rounded-full bg-gray-200">
                <motion.div
                  className="h-full rounded-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            {isCompleted && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                ✓ Complete
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>

                  {/* Entity badges */}
                  {msg.entities && msg.entities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.entities.map((entity, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200"
                        >
                          {entity.type}: {entity.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Entity Summary Sidebar */}
      {allEntities.length > 0 && (
        <div className="border-t bg-white px-4 py-2">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap gap-1">
              <span className="text-xs font-medium text-gray-500 mr-1">Extracted:</span>
              {[...new Set(allEntities.map((e) => `${e.type}:${e.value}`))]
                .slice(-10)
                .map((key, i) => {
                  const [type, value] = key.split(':')
                  return (
                    <span
                      key={i}
                      className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {value}
                    </span>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      {!isCompleted && (
        <div className="border-t bg-white px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your answer..."
              disabled={isLoading}
              className="flex-1 rounded-lg border px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
