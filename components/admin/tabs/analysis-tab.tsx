'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Loader2, Brain, Sparkles, Send } from 'lucide-react'

export default function AnalysisTab() {
  const { t } = useLanguage()
  const [surveys, setSurveys] = useState<any[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<number | null>(null)
  const [analysing, setAnalysing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [freePrompt, setFreePrompt] = useState('')
  const [freeAnswer, setFreeAnswer] = useState('')
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    fetch('/api/admin/surveys').then(r => r?.json?.()).then(d => {
      setSurveys(d ?? [])
      if ((d?.length ?? 0) > 0) setSelectedSurvey(d?.[0]?.id ?? null)
    }).catch(() => {})
  }, [])

  const runAnalysis = async () => {
    if (!selectedSurvey) return
    setAnalysing(true); setAnalysis(null)
    try {
      const res = await fetch('/api/admin/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId: selectedSurvey }),
      })
      const data = await res?.json?.()
      setAnalysis(data ?? null)
    } catch {} finally { setAnalysing(false) }
  }

  const askFreePrompt = async () => {
    if (!freePrompt.trim() || !selectedSurvey) return
    setAsking(true); setFreeAnswer('')
    try {
      const res = await fetch('/api/admin/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId: selectedSurvey, freePrompt }),
      })
      const data = await res?.json?.()
      setFreeAnswer(data?.summary || data?.freePromptAnswer || JSON.stringify(data, null, 2))
    } catch {} finally { setAsking(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('aiSurveyAnalysis')}</h2>
          <p className="text-sm text-slate-500">{t('automaticKnowledgeExtraction')}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <select value={selectedSurvey ?? ''} onChange={(e: any) => setSelectedSurvey(Number(e?.target?.value))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
          {surveys.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <button onClick={runAnalysis} disabled={analysing} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          {analysing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />} {analysing ? t('analyzing') : t('startNewAnalysis')}
        </button>
      </div>

      {/* Free prompt */}
      <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200">
        <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> {t('freePromptTitle')}</h3>
        <p className="text-xs text-slate-500 mb-3">{t('freePromptExample')}</p>
        <div className="flex gap-2">
          <input value={freePrompt} onChange={(e: any) => setFreePrompt(e?.target?.value ?? '')} placeholder={t('freePromptPlaceholder')} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          <button onClick={askFreePrompt} disabled={asking} className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            {asking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {asking ? t('busy') : t('askAI')}
          </button>
        </div>
        {freeAnswer && <div className="mt-3 bg-white rounded-lg p-4 border border-slate-200"><p className="text-xs font-medium text-purple-600 mb-1">{t('aiAnswer')}</p><pre className="text-sm text-slate-700 whitespace-pre-wrap">{freeAnswer}</pre></div>}
      </div>

      {/* Analysis results */}
      {analysis && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          {analysis.summary && <div className="mb-4"><h3 className="font-semibold text-slate-700 mb-2">{t('summary')}</h3><p className="text-sm text-slate-600 whitespace-pre-wrap">{analysis.summary}</p></div>}
          {analysis.themes && Array.isArray(analysis.themes) && analysis.themes.length > 0 && (
            <div className="mb-4"><h3 className="font-semibold text-slate-700 mb-2">{t('identifiedThemes')}</h3><div className="space-y-2">{analysis.themes.map((th: any, i: number) => <div key={i} className="bg-blue-50 rounded-lg p-3 text-sm"><span className="font-medium text-blue-800">{th.name || th}</span>{th.description && <p className="text-blue-600 text-xs mt-1">{th.description}</p>}</div>)}</div></div>
          )}
          {analysis.recommendations && Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
            <div><h3 className="font-semibold text-slate-700 mb-2">{t('recommendationsTitle')}</h3><div className="space-y-2">{analysis.recommendations.map((r: any, i: number) => <div key={i} className="bg-green-50 rounded-lg p-3 text-sm"><span className="text-green-800">{r.text || r.description || r}</span></div>)}</div></div>
          )}
        </div>
      )}

      {!analysis && !analysing && (
        <div className="text-center py-16">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">{t('noAnalysisYet')}</p>
          <p className="text-sm text-slate-400">{t('clickToStartAnalysis')}</p>
        </div>
      )}
    </div>
  )
}
