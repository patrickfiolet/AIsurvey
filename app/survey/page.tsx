'use client'

import { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { languages, Language } from '@/lib/i18n'
import { Loader2, Send, ChevronRight, ChevronLeft, Mic, MicOff, Globe, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

function SurveyContent() {
  const searchParams = useSearchParams()
  const surveyId = searchParams?.get?.('id') ?? '1'
  const mode = searchParams?.get?.('mode') ?? ''
  const { language, setLanguage, t } = useLanguage()
  const [survey, setSurvey] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [listening, setListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  // Conversational mode
  const [convMessages, setConvMessages] = useState<any[]>([])
  const [convInput, setConvInput] = useState('')
  const [convLoading, setConvLoading] = useState(false)
  const [convId, setConvId] = useState<number | null>(null)
  const isConversational = mode === 'conversational' || survey?.surveyType === 'CONVERSATIONAL'
  const SILENCE_TIMEOUT_SECONDS = 60
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listeningRef = useRef(false)
  const conversationStorageKey = `aisurvey:conversation:${surveyId}`

  useEffect(() => {
    fetch(`/api/survey?id=${surveyId}`).then(r => r?.json?.()).then(d => {
      setSurvey(d?.survey ?? null)
      setQuestions(d?.questions ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [surveyId])

  useEffect(() => { listeningRef.current = listening }, [listening])

  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
  }, [])

  const resetSilenceTimeout = useCallback((rec?: any) => {
    clearSilenceTimeout()
    silenceTimeoutRef.current = setTimeout(() => {
      try { rec?.stop?.() } catch {}
      setListening(false)
      listeningRef.current = false
    }, SILENCE_TIMEOUT_SECONDS * 1000)
  }, [SILENCE_TIMEOUT_SECONDS, clearSilenceTimeout])

  // Speech-to-text setup
  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any)?.SpeechRecognition || (window as any)?.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      const langMap: Record<string, string> = { nl: 'nl-NL', de: 'de-DE', en: 'en-US', fr: 'fr-FR', es: 'es-ES', pt: 'pt-PT', it: 'it-IT' }
      rec.lang = langMap?.[language] ?? 'nl-NL'
      rec.onresult = (event: any) => {
        let text = ''
        for (let i = event?.resultIndex ?? 0; i < (event?.results?.length ?? 0); i++) {
          const result = event?.results?.[i]
          if (result?.isFinal) text += (result?.[0]?.transcript ?? '') + ' '
        }
        const finalText = text?.trim?.()
        if (!finalText) return

        if (isConversational) { setConvInput((prev: string) => (prev ? prev + ' ' : '') + finalText) }
        else {
          const qId = questions?.[currentQ]?.id
          if (qId) setAnswers((prev: any) => ({ ...(prev ?? {}), [qId]: ((prev ?? {})?.[qId] ?? '') + (((prev ?? {})?.[qId] ?? '') ? ' ' : '') + finalText }))
        }
        resetSilenceTimeout(rec)
      }
      rec.onerror = () => {
        clearSilenceTimeout()
        setListening(false)
        listeningRef.current = false
      }
      rec.onend = () => {
        if (!listeningRef.current) {
          clearSilenceTimeout()
          return
        }
        try { rec?.start?.() } catch {
          clearSilenceTimeout()
          setListening(false)
          listeningRef.current = false
        }
      }
      setRecognition(rec)
    }

    return () => {
      clearSilenceTimeout()
    }
  }, [language, isConversational, currentQ, questions, clearSilenceTimeout, resetSilenceTimeout])

  const toggleMic = () => {
    if (!recognition) return
    if (listening) {
      clearSilenceTimeout()
      listeningRef.current = false
      recognition?.stop?.()
      setListening(false)
      return
    }

    const langMap: Record<string, string> = { nl: 'nl-NL', de: 'de-DE', en: 'en-US', fr: 'fr-FR', es: 'es-ES', pt: 'pt-PT', it: 'it-IT' }
    recognition.lang = langMap?.[language] ?? 'nl-NL'
    try {
      recognition?.start?.()
      listeningRef.current = true
      setListening(true)
      resetSilenceTimeout(recognition)
    } catch {
      clearSilenceTimeout()
      listeningRef.current = false
      setListening(false)
    }
  }

  const submitSurvey = async () => {
    setSubmitting(true)
    try {
      await fetch('/api/survey/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId: Number(surveyId), respondentName: name, respondentEmail: email, answers: Object.entries(answers ?? {}).map(([qId, val]: [string, any]) => ({ questionId: Number(qId), textValue: val })) }),
      })
      setSubmitted(true)
    } catch {} finally { setSubmitting(false) }
  }

  // Conversational functions
  const startConversation = async () => {
    setShowWelcome(false)
    setConvLoading(true)
    try {
      const storedConvId = typeof window !== 'undefined' ? window.localStorage.getItem(conversationStorageKey) : null
      if (storedConvId) {
        const resumeRes = await fetch('/api/conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            surveyId: Number(surveyId),
            action: 'resume',
            conversationId: Number(storedConvId),
            respondentName: name,
            respondentEmail: email,
            language,
          })
        })
        const resumeData = await resumeRes?.json?.()
        if (resumeData?.conversationId && (resumeData?.messages?.length ?? 0) > 0) {
          setConvId(resumeData.conversationId)
          setConvMessages(resumeData.messages)
          return
        }
        if (typeof window !== 'undefined') window.localStorage.removeItem(conversationStorageKey)
      }

      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId: Number(surveyId), action: 'start', respondentName: name, respondentEmail: email, language })
      })
      const data = await res?.json?.()
      if (data?.conversationId && typeof window !== 'undefined') {
        window.localStorage.setItem(conversationStorageKey, String(data.conversationId))
      }
      setConvId(data?.conversationId ?? null)
      setConvMessages([{ role: 'AI', content: data?.message ?? '' }])
    } catch {} finally { setConvLoading(false) }
  }

  const sendConvMessage = async () => {
    if (!convInput?.trim?.() || !convId) return
    const msg = convInput
    setConvInput('')
    setConvMessages((prev: any[]) => [...(prev ?? []), { role: 'USER', content: msg }])
    setConvLoading(true)
    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId, message: msg, action: 'message', language })
      })
      const data = await res?.json?.()
      setConvMessages((prev: any[]) => [...(prev ?? []), { role: 'AI', content: data?.message ?? '' }])
      if (data?.isCompleted) {
        if (typeof window !== 'undefined') window.localStorage.removeItem(conversationStorageKey)
        setSubmitted(true)
      } else if (typeof window !== 'undefined') {
        window.localStorage.setItem(conversationStorageKey, String(convId))
      }
    } catch {} finally { setConvLoading(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
  if (!survey) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">{t('surveyNotFound')}</p></div>

  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('thankYou')}</h2>
        <p className="text-slate-600">{survey?.thankYouText ?? t('thankYouMessage')}</p>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8"><Image src="/logo.png" alt="Logo" fill className="object-contain rounded" /></div>
            <div><span className="font-bold text-slate-800">AIsurvey.me</span><span className="block text-[9px] text-purple-600 font-semibold -mt-1">v3.0</span></div>
          </div>
          <select value={language} onChange={(e: any) => setLanguage(e?.target?.value as Language)} className="text-xs border rounded-lg px-2 py-1">
            {(languages ?? []).map((l: any) => <option key={l?.code} value={l?.code}>{l?.flag} {l?.name}</option>)}
          </select>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-4 py-8">
        {/* Welcome screen */}
        {showWelcome && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">{survey?.title}</h1>
            <p className="text-slate-600 mb-6">{survey?.welcomeText}</p>
            {!survey?.isAnonymous && (
              <div className="space-y-3 mb-6 max-w-sm mx-auto">
                <input value={name} onChange={(e: any) => setName(e?.target?.value ?? '')} placeholder={t('yourName')} className="w-full border rounded-lg px-3 py-2 text-sm" />
                <input value={email} onChange={(e: any) => setEmail(e?.target?.value ?? '')} placeholder={t('yourEmail')} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
            <button onClick={() => isConversational ? startConversation() : setShowWelcome(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold">
              {t('startSurvey')}
            </button>
          </motion.div>
        )}

        {/* Conversational Interface */}
        {!showWelcome && isConversational && !submitted && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {(convMessages ?? []).map((m: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m?.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m?.role === 'USER' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                      {m?.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {convLoading && <div className="flex justify-start"><div className="bg-slate-100 rounded-2xl px-4 py-3"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div></div>}
            </div>
            <div className="border-t p-4 flex gap-2">
              <button onClick={toggleMic} className={`p-2 rounded-lg ${listening ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input value={convInput} onChange={(e: any) => setConvInput(e?.target?.value ?? '')} onKeyDown={(e: any) => e?.key === 'Enter' && sendConvMessage()} placeholder={t('typeMessage')} className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              <button onClick={sendConvMessage} disabled={convLoading} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"><Send className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {/* Static Survey Interface */}
        {!showWelcome && !isConversational && !submitted && (questions?.length ?? 0) > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">{t('question')} {currentQ + 1} / {questions?.length ?? 0}</span>
                <div className="h-2 flex-1 mx-4 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${((currentQ + 1) / (questions?.length ?? 1)) * 100}%` }} />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mt-4">{questions?.[currentQ]?.title}</h2>
            </div>
            <div className="relative">
              <textarea
                value={answers?.[questions?.[currentQ]?.id] ?? ''}
                onChange={(e: any) => { const qId = questions?.[currentQ]?.id; if (qId) setAnswers((prev: any) => ({ ...(prev ?? {}), [qId]: e?.target?.value ?? '' })) }}
                placeholder={t('typeAnswer')}
                rows={4}
                className="w-full border rounded-lg px-4 py-3 text-sm resize-none pr-12"
              />
              <button onClick={toggleMic} className={`absolute right-3 top-3 p-1.5 rounded-lg transition-colors ${listening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`} title={t('speechToText')}>
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" /> {t('previous')}
              </button>
              {currentQ < (questions?.length ?? 0) - 1 ? (
                <button onClick={() => setCurrentQ(currentQ + 1)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white">
                  {t('next')} <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={submitSurvey} disabled={submitting} className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm bg-green-600 hover:bg-green-700 text-white">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {t('submit')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function SurveyPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>}><SurveyContent /></Suspense>
}
