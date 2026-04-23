'use client'

import { useLanguage } from '@/lib/language-context'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { LayoutDashboard, FileText, HelpCircle, MessageSquare, BarChart3, Phone, Globe, Settings, Users, LogOut } from 'lucide-react'

interface AdminSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const { data: session } = useSession() || {}
  const { t } = useLanguage()

  const navItems = [
    { id: 'surveys', icon: FileText, label: t('menuSurveys') },
    { id: 'dashboard', icon: LayoutDashboard, label: t('menuDashboard') },
    { id: 'questions', icon: HelpCircle, label: t('menuQuestions') },
    { id: 'responses', icon: MessageSquare, label: t('menuResponses') },
    { id: 'voiceAgent', icon: Phone, label: t('menuVoiceAgent') },
    { id: 'analysis', icon: BarChart3, label: t('menuAnalysis') },
    { id: 'translations', icon: Globe, label: t('menuTranslations') },
    { id: 'settings', icon: Settings, label: t('menuSettings') },
    { id: 'users', icon: Users, label: t('menuUsers') },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-[#1a2236] text-white flex flex-col z-50">
      {/* Logo section */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 flex-shrink-0">
            <Image src="/logo.png" alt="AIsurvey.me logo" fill className="object-contain rounded" />
          </div>
          <div>
            <span className="font-bold text-[15px] text-white block leading-tight">aisurvey.me</span>
            <span className="text-[10px] text-slate-400 block leading-tight">AI Survey Intelligence</span>
            <span className="text-[9px] text-purple-400 font-semibold block leading-tight">v3.0</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
            {(session?.user?.name || session?.user?.email || 'S')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{session?.user?.name || 'Survey Administrator'}</p>
            <p className="text-[10px] text-slate-400 truncate">{session?.user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  )
}
