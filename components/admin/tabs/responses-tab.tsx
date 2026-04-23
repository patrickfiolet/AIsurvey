'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Loader2, Download, MessageSquare } from 'lucide-react'

export default function ResponsesTab() {
  const { t } = useLanguage()
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/responses')
      .then(r => r?.json?.()).then(d => { setResponses(d ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const exportCSV = () => {
    if (!responses?.length) return
    const headers = ['Respondent', 'Email', 'Survey', 'Date', 'Answers']
    const rows = responses.map((r: any) => [
      r.respondentName || t('anonymousLabel'),
      r.respondentEmail || '',
      r.survey?.title || '',
      r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
      (r.answers || []).map((a: any) => `${a.question?.title || ''}: ${a.textValue || a.selectedOption || ''}`).join(' | '),
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'responses.csv'; a.click()
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('surveyResponsesTitle')}</h2>
          <p className="text-sm text-slate-500">{responses.length} {responses.length === 1 ? t('responseCount') : t('responsesCountPlural')} {t('receivedLabel')}</p>
        </div>
        {responses.length > 0 && (
          <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" /> {t('exportToCsvBtn')}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {responses.map((r: any) => (
          <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{r.respondentName || t('anonymousLabel')}</span>
                {r.survey?.title && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{r.survey.title}</span>}
              </div>
              <span className="text-xs text-slate-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
            </div>
            <div className="space-y-1.5">
              {(r.answers ?? []).slice(0, 5).map((a: any) => (
                <div key={a.id} className="text-sm">
                  <span className="font-medium text-slate-600">{a.question?.title ?? ''}:</span>
                  <span className="text-slate-700 ml-1">{a.textValue ?? a.selectedOption ?? ''}</span>
                </div>
              ))}
              {(r.answers?.length ?? 0) > 5 && <p className="text-xs text-slate-400">+{r.answers.length - 5} {t('answers')}</p>}
            </div>
          </div>
        ))}
        {responses.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t('noResponsesYetTitle')}</p>
            <p className="text-sm text-slate-400">{t('responsesWillAppear')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
