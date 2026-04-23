'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Plus, Trash2, Save, X, Sparkles, Loader2, Edit2, Wand2 } from 'lucide-react'

export default function QuestionsTab() {
  const { language, t } = useLanguage()
  const [surveys, setSurveys] = useState<any[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<number | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newQ, setNewQ] = useState('')
  const [newType, setNewType] = useState('OPEN_TEXT')
  const [newOptions, setNewOptions] = useState<string[]>(['', ''])
  const [newRequired, setNewRequired] = useState(true)
  // AI generation
  const [showAI, setShowAI] = useState(false)
  const [aiTopic, setAiTopic] = useState('')
  const [aiCount, setAiCount] = useState(5)
  const [aiLoading, setAiLoading] = useState(false)
  // Edit
  const [editId, setEditId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    fetch('/api/admin/surveys').then(r => r?.json?.()).then(d => {
      setSurveys(d ?? [])
      if ((d?.length ?? 0) > 0) setSelectedSurvey(d?.[0]?.id ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const loadQuestions = useCallback(() => {
    if (!selectedSurvey) return
    fetch(`/api/admin/questions?surveyId=${selectedSurvey}`)
      .then(r => r?.json?.()).then(d => setQuestions(d ?? [])).catch(() => {})
  }, [selectedSurvey])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  const addQuestion = async () => {
    if (!newQ?.trim?.() || !selectedSurvey) return
    const body: any = { surveyId: selectedSurvey, title: newQ, type: newType, isRequired: newRequired }
    if (newType === 'MULTIPLE_CHOICE') body.options = newOptions.filter((o: string) => o.trim())
    await fetch('/api/admin/questions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    setNewQ(''); setShowAdd(false); setNewType('OPEN_TEXT'); setNewOptions(['', '']); loadQuestions()
  }

  const deleteQuestion = async (id: number) => {
    if (!confirm(t('confirmDeleteQuestion'))) return
    await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' })
    loadQuestions()
  }

  const saveEdit = async (id: number) => {
    if (!editText.trim()) return
    await fetch('/api/admin/questions', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title: editText }),
    })
    setEditId(null); setEditText(''); loadQuestions()
  }

  const generateWithAI = async () => {
    if (!aiTopic?.trim?.() || !selectedSurvey) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/admin/generate-questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, count: aiCount, language, surveyId: selectedSurvey }),
      })
      const data = await res?.json?.()
      if (data?.success) { setShowAI(false); setAiTopic(''); loadQuestions() }
    } catch {} finally { setAiLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>

  const typeLabel = (type: string) => {
    if (type === 'MULTIPLE_CHOICE') return t('multipleChoice')
    if (type === 'RATING_SCALE') return t('ratingScale')
    return t('openText')
  }

  const typeColor = (type: string) => {
    if (type === 'MULTIPLE_CHOICE') return 'bg-blue-100 text-blue-700'
    if (type === 'RATING_SCALE') return 'bg-amber-100 text-amber-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('questionsManagement')}</h2>
          <p className="text-sm text-slate-500">{t('manageQuestionsDesc')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAI(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
            <Sparkles className="w-4 h-4" /> {t('aiGenerateQuestions')}
          </button>
          <button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> {t('newQuestion')}
          </button>
        </div>
      </div>

      <select
        value={selectedSurvey ?? ''}
        onChange={(e: any) => setSelectedSurvey(Number(e?.target?.value))}
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 w-full max-w-xs"
      >
        {surveys.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
      </select>

      {/* AI Generation panel */}
      {showAI && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-purple-800 flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5" /> {t('aiGenerateQuestions')}</h3>
          <p className="text-sm text-purple-600 mb-3">{t('aiGenerateQuestionsDesc')}</p>
          <textarea
            value={aiTopic}
            onChange={(e: any) => setAiTopic(e?.target?.value ?? '')}
            placeholder={t('aiQuestionPromptPlaceholder')}
            className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm mb-3 min-h-[80px] focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm text-slate-600">{t('numberOfQuestions')}:</label>
            <input type="number" value={aiCount} min={1} max={20} onChange={(e: any) => setAiCount(Number(e?.target?.value) || 5)} className="border rounded-lg px-3 py-2 text-sm w-20" />
          </div>
          <div className="flex gap-2">
            <button onClick={generateWithAI} disabled={aiLoading} className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} {aiLoading ? t('generating') : t('generateWithAI')}
            </button>
            <button onClick={() => setShowAI(false)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm">{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* Add question form */}
      {showAdd && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-4 border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-3">{t('addNewQuestionTitle')}</h3>
          <div className="space-y-3">
            <textarea
              value={newQ}
              onChange={(e: any) => setNewQ(e?.target?.value ?? '')}
              placeholder={t('typeYourQuestion')}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[60px] focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-3">
              <select value={newType} onChange={(e: any) => setNewType(e?.target?.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="OPEN_TEXT">{t('openTextOption')}</option>
                <option value="MULTIPLE_CHOICE">{t('multipleChoiceOption')}</option>
                <option value="RATING_SCALE">{t('ratingScaleOption')}</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={newRequired} onChange={(e: any) => setNewRequired(e?.target?.checked)} className="rounded" />
                {t('requiredQuestionLabel')}
              </label>
            </div>
            {newType === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">{t('answerOptionsLabel')}</label>
                {newOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={opt} onChange={(e: any) => { const updated = [...newOptions]; updated[i] = e?.target?.value ?? ''; setNewOptions(updated) }} placeholder={`${t('optionPlaceholder')} ${i + 1}`} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                    {newOptions.length > 2 && <button onClick={() => setNewOptions(newOptions.filter((_, j) => j !== i))} className="text-red-500 text-xs">&times;</button>}
                  </div>
                ))}
                <button onClick={() => setNewOptions([...newOptions, ''])} className="text-sm text-blue-600 hover:text-blue-700">{t('addOptionBtn')}</button>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={addQuestion} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Save className="w-4 h-4" /> {t('addQuestionBtn')}</button>
              <button onClick={() => setShowAdd(false)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-2">
        {questions.map((q: any, i: number) => (
          <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-xs font-mono text-slate-400 mt-0.5 flex-shrink-0 w-5">{t('questionLabel')} {i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeColor(q.type)}`}>{typeLabel(q.type)}</span>
                    {q.isRequired && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">{t('requiredBadge')}</span>}
                  </div>
                  {editId === q.id ? (
                    <div className="flex gap-2 mt-1">
                      <input value={editText} onChange={(e: any) => setEditText(e?.target?.value ?? '')} className="flex-1 border rounded-lg px-2 py-1 text-sm" />
                      <button onClick={() => saveEdit(q.id)} className="text-blue-600 hover:text-blue-700"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setEditId(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-800">{q.title}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <button onClick={() => { setEditId(q.id); setEditText(q.title) }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600" title={t('editTooltip')}><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteQuestion(q.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500" title={t('deleteTooltip')}><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        {questions.length === 0 && <p className="text-center text-slate-500 py-8">{t('noQuestionsYet')}</p>}
      </div>
    </div>
  )
}
