'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Plus, Eye, Trash2, Copy, Settings, Loader2, MessageSquare, FileText, Phone, ToggleLeft, ToggleRight } from 'lucide-react'

export default function SurveysTab() {
  const { t } = useLanguage()
  const [surveys, setSurveys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newType, setNewType] = useState('STATIC')
  const [creating, setCreating] = useState(false)

  const loadSurveys = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/surveys')
      .then(r => r?.json?.())
      .then(d => { setSurveys(d ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { loadSurveys() }, [loadSurveys])

  const createSurvey = async () => {
    if (!newTitle?.trim?.()) return
    setCreating(true)
    try {
      await fetch('/api/admin/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc, surveyType: newType }),
      })
      setNewTitle(''); setNewDesc(''); setShowCreate(false); loadSurveys()
    } catch {} finally { setCreating(false) }
  }

  const toggleActive = async (s: any) => {
    await fetch('/api/admin/surveys', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, isActive: !s.isActive }),
    })
    loadSurveys()
  }

  const duplicateSurvey = async (s: any) => {
    await fetch('/api/admin/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: s.title + ' (copy)', surveyType: s.surveyType }),
    })
    loadSurveys()
  }

  const deleteSurvey = async (id: number) => {
    if (!confirm(t('confirmDeleteSurvey'))) return
    await fetch(`/api/admin/surveys?id=${id}`, { method: 'DELETE' })
    loadSurveys()
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>

  const typeIcon = (type: string) => {
    if (type === 'CONVERSATIONAL') return <MessageSquare className="w-3.5 h-3.5" />
    if (type === 'VOICE_AGENT') return <Phone className="w-3.5 h-3.5" />
    return <FileText className="w-3.5 h-3.5" />
  }

  const typeLabel = (type: string) => {
    if (type === 'CONVERSATIONAL') return t('aiChat')
    if (type === 'VOICE_AGENT') return t('voiceAgent')
    return t('staticLabel')
  }

  const typeColor = (type: string) => {
    if (type === 'CONVERSATIONAL') return 'bg-purple-100 text-purple-700'
    if (type === 'VOICE_AGENT') return 'bg-orange-100 text-orange-700'
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('surveyManagement')}</h2>
          <p className="text-sm text-slate-500">{t('manageSurveysDescription')}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> {t('newSurvey')}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-4">{t('createNewSurveyModal')}</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t('surveyTitleLabel')}</label>
              <input value={newTitle} onChange={(e: any) => setNewTitle(e?.target?.value ?? '')} placeholder={t('placeholderSurveyTitle')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t('descriptionOptional')}</label>
              <input value={newDesc} onChange={(e: any) => setNewDesc(e?.target?.value ?? '')} placeholder={t('placeholderDescription')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t('surveyTypeLabel')}</label>
              <select value={newType} onChange={(e: any) => setNewType(e?.target?.value ?? 'STATIC')} className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full">
                <option value="STATIC">{t('staticSurveyTitle')}</option>
                <option value="CONVERSATIONAL">{t('conversationalSurveyTitle')}</option>
                <option value="VOICE_AGENT">{t('voiceAgent')}</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={createSurvey} disabled={creating} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {t('createSurveyButton')}
              </button>
              <button onClick={() => setShowCreate(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {surveys.map((s: any) => (
          <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800 truncate">{s.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${typeColor(s.surveyType)}`}>
                    {typeIcon(s.surveyType)} {typeLabel(s.surveyType)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{s.description || t('defaultSurveyDescription')}</p>
              </div>
              <button onClick={() => toggleActive(s)} className="flex-shrink-0 ml-2" title={s.isActive ? t('activeClickDeactivate') : t('inactiveClickActivate')}>
                {s.isActive
                  ? <ToggleRight className="w-6 h-6 text-green-500" />
                  : <ToggleLeft className="w-6 h-6 text-slate-400" />
                }
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {s._count?.questions ?? s.questions?.length ?? 0} {t('questionsCount')}</span>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {s._count?.responses ?? 0} {t('responsesCount')}</span>
            </div>
            <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3">
              <button onClick={() => {}} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title={t('manageSurvey')}><Settings className="w-4 h-4" /></button>
              <button onClick={() => duplicateSurvey(s)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors" title={t('duplicateSurveyTooltip')}><Copy className="w-4 h-4" /></button>
              <button onClick={() => window.open(`/survey?id=${s.id}`, '_blank')} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-green-600 transition-colors" title={t('viewSurveyTooltip')}><Eye className="w-4 h-4" /></button>
              <button onClick={() => deleteSurvey(s.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors" title={t('deleteSurveyTooltip')}><Trash2 className="w-4 h-4" /></button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">{t('createdOn')} {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}</p>
          </div>
        ))}
      </div>

      {surveys.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-2">{t('noSurveysYet')}</p>
          <p className="text-sm text-slate-400">{t('startCreatingFirstSurvey')}</p>
        </div>
      )}
    </div>
  )
}
