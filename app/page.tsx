'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { languages, Language } from '@/lib/i18n'
import { Brain, MessageSquare, Phone, BarChart3, Globe, Mic, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const features = [
    { icon: Brain, title: t('featureAITitle'), desc: t('featureAIDesc') },
    { icon: MessageSquare, title: t('conversationalSurvey'), desc: t('conversationalSurveyDesc') },
    { icon: Phone, title: t('voiceAgent'), desc: t('voiceAgentDescription') },
    { icon: BarChart3, title: t('featureInsightsTitle'), desc: t('featureInsightsDesc') },
    { icon: Globe, title: t('multiLanguage'), desc: t('multiLanguageDesc') },
    { icon: Mic, title: t('speechToText'), desc: t('speechToTextDesc') },
  ]

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex-shrink-0">
        <div className="max-w-[1200px] mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9">
              <Image src="/logo.png" alt="AIsurvey.me logo" fill className="object-contain rounded" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-800">aisurvey.me</span>
              <span className="block text-[9px] text-purple-600 font-semibold -mt-1">v3.0</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e: any) => setLanguage(e?.target?.value as Language)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
            >
              {(languages ?? []).map((l: any) => (
                <option key={l?.code} value={l?.code}>{l?.flag} {l?.name}</option>
              ))}
            </select>
            <Link href="/admin/login" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
              {t('adminLogin')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main content - fits in one screen */}
      <main className="flex-1 flex flex-col justify-center max-w-[1200px] mx-auto px-6 w-full">
        {/* Hero section - compact */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
            <Sparkles className="w-3 h-3" />
            {t('poweredByAI')}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 leading-tight">
            {t('landingTitle')}
          </h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto mb-4">
            {t('landingDescription')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/survey?id=1" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-md">
              {t('startSurvey')}
            </Link>
            <Link href="/survey?id=2&mode=conversational" className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm border border-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> {t('tryConversational')}
            </Link>
          </div>
        </div>

        {/* Features grid - compact */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {features.map((f, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <f.icon className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <h3 className="text-xs font-semibold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-[10px] text-slate-500 leading-tight">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer - compact */}
      <footer className="bg-slate-900 text-slate-400 py-3 flex-shrink-0">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">AIsurvey.me</span>
            <span className="text-purple-400 text-[10px] font-semibold">v3.0</span>
          </div>
          <p className="text-xs">© 2026 Filos-IT B.V. — knowledge-os.net</p>
          <Link href="/admin/login" className="text-xs hover:text-white transition-colors">{t('adminLogin')}</Link>
        </div>
      </footer>
    </div>
  )
}
