'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/language-context'
import { languages, Language } from '@/lib/i18n'
import { Loader2, Save, Globe, Languages } from 'lucide-react'

export default function TranslationsTab() {
  const { t } = useLanguage()
  const [surveys, setSurveys] = useState<any[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<number | null>(null)
  const [selectedLang, setSelectedLang] = useState<Language>('en')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [survey, setSurvey] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/surveys').then(r => r?.json?.()).then(d => {
      setSurveys(d ?? [])
      if ((d?.length ?? 0) > 0) setSelectedSurvey(d?.[0]?.id ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const loadTranslations = useCallback(async () => {
    if (!selectedSurvey) return
    try {
      const [surveyRes, questionsRes, translationsRes] = await Promise.all([
        fetch(`/api/survey?id=${selectedSurvey}`).then(r => r.json()),
        fetch(`/api/admin/questions?surveyId=${selectedSurvey}`).then(r => r.json()),
        fetch(`/api/admin/translations?surveyId=${selectedSurvey}&language=${selectedLang}`).then(r => r.json()),
      ])
      setSurvey(surveyRes?.survey ?? null)
      setQuestions(questionsRes ?? [])
      const transMap: Record<string, string> = {}
      ;(translationsRes ?? []).forEach((tr: any) => {
        transMap[`${tr.entityType}_${tr.entityId}_${tr.fieldName}`] = tr.content
      })
      setTranslations(transMap)
    } catch {}
  }, [selectedSurvey, selectedLang])

  useEffect(() => { loadTranslations() }, [loadTranslations])

  const updateTranslation = (key: string, value: string) => {
    setTranslations(prev => ({ ...prev, [key]: value }))
  }

  const saveTranslations = async () => {
    if (!selectedSurvey) return
    setSaving(true); setMessage('')
    try {
      const translationsToSave: any[] = []
      Object.entries(translations).forEach(([key, content]) => {
        if (!content?.trim()) return
        const [entityType, entityIdStr, ...fieldParts] = key.split('_')
        const entityId = Number(entityIdStr)
        const fieldName = fieldParts.join('_')
        translationsToSave.push({ entityType, entityId, language: selectedLang, fieldName, content })
      })
      const res = await fetch('/api/admin/translations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ translations: translationsToSave }),
      })
      const data = await res.json()
      if (data.success) setMessage(`${t('translationsSavedFor')} ${selectedLang}`)
    } catch { setMessage(t('errorSavingTranslations')) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('manageTranslations')}</h2>
          <p className="text-sm text-slate-500">{t('translateSurvey')}</p>
        </div>
        <button onClick={saveTranslations} disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? t('savingSettings') : t('save')}
        </button>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm mb-4">{message}</div>}

      <div className="flex gap-3 mb-6">
        <select value={selectedSurvey ?? ''} onChange={(e: any) => setSelectedSurvey(Number(e?.target?.value))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
          {surveys.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">{t('translateTo')}:</span>
          <select value={selectedLang} onChange={(e: any) => setSelectedLang(e?.target?.value as Language)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
            {languages.filter(l => l.code !== 'nl').map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>
        </div>
      </div>

      {survey && (
        <div className="space-y-6">
          {/* Survey info translations */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Languages className="w-4 h-4" /> {t('surveyInfo')}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">{t('surveyTitle')} <span className="text-slate-400">({t('originalLabel')} {survey.title})</span></label>
                <input
                  value={translations[`survey_${selectedSurvey}_title`] ?? ''}
                  onChange={(e: any) => updateTranslation(`survey_${selectedSurvey}_title`, e?.target?.value ?? '')}
                  placeholder={`${t('translateTo')} ${selectedLang}`}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">{t('welcomeText')} <span className="text-slate-400">({t('originalLabel')} {(survey.welcomeText || '').substring(0, 50)}...)</span></label>
                <textarea
                  value={translations[`survey_${selectedSurvey}_welcomeText`] ?? ''}
                  onChange={(e: any) => updateTranslation(`survey_${selectedSurvey}_welcomeText`, e?.target?.value ?? '')}
                  placeholder={`${t('translateTo')} ${selectedLang}`}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">{t('thankYouText')} <span className="text-slate-400">({t('originalLabel')} {(survey.thankYouText || '').substring(0, 50)}...)</span></label>
                <textarea
                  value={translations[`survey_${selectedSurvey}_thankYouText`] ?? ''}
                  onChange={(e: any) => updateTranslation(`survey_${selectedSurvey}_thankYouText`, e?.target?.value ?? '')}
                  placeholder={`${t('translateTo')} ${selectedLang}`}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
            </div>
          </div>

          {/* Question translations */}
          {questions.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-4">{t('questions')} ({questions.length})</h3>
              <div className="space-y-4">
                {questions.map((q: any, i: number) => (
                  <div key={q.id} className="border-b border-slate-100 pb-3 last:border-0">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{t('questionLabel')} {i + 1}: <span className="text-slate-400">{q.title}</span></label>
                    <input
                      value={translations[`question_${q.id}_title`] ?? ''}
                      onChange={(e: any) => updateTranslation(`question_${q.id}_title`, e?.target?.value ?? '')}
                      placeholder={`${t('translateTo')} ${selectedLang}`}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                    {q.options && q.options.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <span className="text-[10px] text-slate-500">{t('optionsLabel')}</span>
                        {q.options.map((opt: string, j: number) => (
                          <div key={j} className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-20 truncate">{opt}</span>
                            <input
                              value={translations[`question_${q.id}_option_${j}`] ?? ''}
                              onChange={(e: any) => updateTranslation(`question_${q.id}_option_${j}`, e?.target?.value ?? '')}
                              placeholder={`${t('translateOptionTo')} ${selectedLang}`}
                              className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
