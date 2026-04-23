'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { languages, Language } from '@/lib/i18n'
import AdminSidebar from './admin-sidebar'
import DashboardTab from './tabs/dashboard-tab'
import SurveysTab from './tabs/surveys-tab'
import QuestionsTab from './tabs/questions-tab'
import ResponsesTab from './tabs/responses-tab'
import AnalysisTab from './tabs/analysis-tab'
import VoiceAgentTab from './tabs/voice-agent-tab'
import TranslationsTab from './tabs/translations-tab'
import SettingsTab from './tabs/settings-tab'
import UsersTab from './tabs/users-tab'
import { Eye, Globe } from 'lucide-react'

export default function AdminDashboard() {
  const { language, setLanguage, t } = useLanguage()
  const [activeTab, setActiveTab] = useState('surveys')
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const tabTitles: Record<string, string> = {
    surveys: t('menuSurveys'),
    dashboard: t('menuDashboard'),
    questions: t('menuQuestions'),
    responses: t('menuResponses'),
    voiceAgent: t('menuVoiceAgent'),
    analysis: t('menuAnalysis'),
    translations: t('menuTranslations'),
    settings: t('menuSettings'),
    users: t('menuUsers'),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content */}
      <div className="ml-[200px]">
        {/* Top header bar */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800">{tabTitles[activeTab] || ''}</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open('/survey?id=1', '_blank')}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {t('viewSurvey')}
              </button>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-400" />
                <select
                  value={language}
                  onChange={(e: any) => setLanguage(e?.target?.value as Language)}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
                >
                  {(languages ?? []).map((l: any) => (
                    <option key={l?.code} value={l?.code}>{l?.flag} {l?.name}</option>
                  ))}
                </select>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {t('admin')}
              </span>
            </div>
          </div>
        </header>

        {/* Tab content */}
        <main className="p-6">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'surveys' && <SurveysTab />}
          {activeTab === 'questions' && <QuestionsTab />}
          {activeTab === 'responses' && <ResponsesTab />}
          {activeTab === 'analysis' && <AnalysisTab />}
          {activeTab === 'voiceAgent' && <VoiceAgentTab />}
          {activeTab === 'translations' && <TranslationsTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'users' && <UsersTab />}
        </main>
      </div>
    </div>
  )
}
