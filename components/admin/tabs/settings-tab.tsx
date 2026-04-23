'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Loader2, Save, Settings } from 'lucide-react'

export default function SettingsTab() {
  const { t } = useLanguage()
  const [surveys, setSurveys] = useState<any[]>([])
  const [selectedSurvey, setSelectedSurvey] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ title: '', description: '', welcomeText: '', thankYouText: '', isActive: true, isAnonymous: false })

  useEffect(() => {
    fetch('/api/admin/surveys').then(r => r?.json?.()).then(d => {
      setSurveys(d ?? [])
      if ((d?.length ?? 0) > 0) setSelectedSurvey(d?.[0]?.id ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedSurvey) return
    fetch(`/api/survey?id=${selectedSurvey}`).then(r => r?.json?.()).then(d => {
      const s = d?.survey
      if (s) setForm({ title: s.title || '', description: s.description || '', welcomeText: s.welcomeText || '', thankYouText: s.thankYouText || '', isActive: s.isActive ?? true, isAnonymous: s.isAnonymous ?? false })
    }).catch(() => {})
  }, [selectedSurvey])

  const saveSettings = async () => {
    if (!selectedSurvey) return
    setSaving(true); setMessage('')
    try {
      await fetch('/api/admin/surveys', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSurvey, ...form }),
      })
      setMessage(t('settingsSaved'))
    } catch { setMessage(t('errorSavingSettings')) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('surveySettings')}</h2>
          <p className="text-sm text-slate-500">{t('manageSettings')}</p>
        </div>
        <button onClick={saveSettings} disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? t('savingSettings') : t('saveSettings')}
        </button>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm mb-4">{message}</div>}

      <select value={selectedSurvey ?? ''} onChange={(e: any) => setSelectedSurvey(Number(e?.target?.value))} className="border border-slate-200 rounded-lg px-3 py-2 text-sm mb-6">
        {surveys.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
      </select>

      <div className="space-y-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">{t('basicInfo')}</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t('surveyTitleLabel')}</label>
              <input value={form.title} onChange={(e: any) => setForm(f => ({ ...f, title: e?.target?.value ?? '' }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t('descriptionLabel')}</label>
              <textarea value={form.description} onChange={(e: any) => setForm(f => ({ ...f, description: e?.target?.value ?? '' }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[60px]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">{t('surveyTexts')}</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t('welcomeTextLabel')}</label>
              <p className="text-[10px] text-slate-400 mb-1">{t('welcomeTextHint')}</p>
              <textarea value={form.welcomeText} onChange={(e: any) => setForm(f => ({ ...f, welcomeText: e?.target?.value ?? '' }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px]" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t('thankYouTextLabel')}</label>
              <p className="text-[10px] text-slate-400 mb-1">{t('thankYouTextHint')}</p>
              <textarea value={form.thankYouText} onChange={(e: any) => setForm(f => ({ ...f, thankYouText: e?.target?.value ?? '' }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">{t('statusAndPrivacy')}</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e: any) => setForm(f => ({ ...f, isActive: e?.target?.checked }))} className="rounded" />
              <div>
                <span className="text-sm font-medium text-slate-700">{t('surveyStatusLabel')}</span>
                <p className="text-xs text-slate-500">{form.isActive ? t('surveyIsActive') : t('surveyIsInactive')}</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isAnonymous} onChange={(e: any) => setForm(f => ({ ...f, isAnonymous: e?.target?.checked }))} className="rounded" />
              <div>
                <span className="text-sm font-medium text-slate-700">{t('anonymousResponses')}</span>
                <p className="text-xs text-slate-500">{form.isAnonymous ? t('namesEmailsNotRequired') : t('namesEmailsRequired')}</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
