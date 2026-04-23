'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Loader2, Phone, Plus, Save, Trash2, RefreshCw, Settings, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function VoiceAgentTab() {
  const { t } = useLanguage()
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [surveys, setSurveys] = useState<any[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<number | null>(null)
  // Voice Agent Questions
  const [vaQuestions, setVaQuestions] = useState<any[]>([])
  const [newVQ, setNewVQ] = useState('')
  const [selectedCall, setSelectedCall] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/agent-calls').then(r => r?.json?.()),
      fetch('/api/admin/surveys').then(r => r?.json?.()),
    ]).then(([callsData, surveysData]) => {
      setCalls(callsData ?? [])
      setSurveys(surveysData ?? [])
      const voiceSurvey = (surveysData ?? []).find((s: any) => s.surveyType === 'VOICE_AGENT')
      if (voiceSurvey) setSelectedSurvey(voiceSurvey.id)
      else if ((surveysData?.length ?? 0) > 0) setSelectedSurvey(surveysData[0].id)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const syncCalls = async () => {
    setSyncing(true)
    try {
      await fetch('/api/admin/agent-calls').then(r => r?.json?.()).then(d => setCalls(d ?? []))
    } catch {} finally { setSyncing(false) }
  }

  const statusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (status === 'FAILED') return <XCircle className="w-4 h-4 text-red-500" />
    if (status === 'IN_PROGRESS') return <Clock className="w-4 h-4 text-yellow-500" />
    return <AlertCircle className="w-4 h-4 text-slate-400" />
  }

  const statusLabel = (status: string) => {
    if (status === 'COMPLETED') return t('statusCompleted')
    if (status === 'FAILED') return t('statusFailed')
    if (status === 'IN_PROGRESS') return t('statusInProgress')
    return t('statusNoAnswer')
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('voiceAIAgent')}</h2>
          <p className="text-sm text-slate-500">{t('voiceAgentSubtitle')}</p>
        </div>
        <button onClick={syncCalls} disabled={syncing} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} {syncing ? t('refreshing') : t('refresh')}
        </button>
      </div>

      {/* VAPI Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-700">{t('voiceAgentTip')}</p>
      </div>

      {/* Calls list */}
      <h3 className="font-semibold text-slate-700 mb-3">{t('conversations')} ({calls.length})</h3>
      <div className="space-y-3">
        {calls.map((c: any) => (
          <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCall(selectedCall?.id === c.id ? null : c)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="font-medium text-slate-800">{c.firstName || ''} {c.lastName || ''}</span>
                  {c.phoneNumber && <span className="text-xs text-slate-500 ml-2">{c.phoneNumber}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.duration && <span className="text-xs text-slate-500">{Math.round(c.duration / 60)} {t('min')}</span>}
                <span className="flex items-center gap-1 text-xs">{statusIcon(c.status)} {statusLabel(c.status)}</span>
              </div>
            </div>
            {selectedCall?.id === c.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                {c.dailyActivities && <div className="text-sm"><span className="font-medium text-slate-600">{t('whatDoneToday')}</span> <span className="text-slate-700">{c.dailyActivities}</span></div>}
                {c.challenges && <div className="text-sm"><span className="font-medium text-slate-600">{t('challengesLabel')}</span> <span className="text-slate-700">{c.challenges}</span></div>}
                {c.tomorrowActions && <div className="text-sm"><span className="font-medium text-slate-600">{t('tomorrowActionsLabel')}</span> <span className="text-slate-700">{c.tomorrowActions}</span></div>}
                {c.transcript && <div className="text-sm mt-2"><span className="font-medium text-slate-600">{t('fullTranscript')}:</span><pre className="text-xs text-slate-600 mt-1 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap max-h-60 overflow-y-auto">{c.transcript}</pre></div>}
              </div>
            )}
          </div>
        ))}
        {calls.length === 0 && (
          <div className="text-center py-16">
            <Phone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t('noConversationsYet')}</p>
            <p className="text-sm text-slate-400">{t('conversationsWillAppear')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
