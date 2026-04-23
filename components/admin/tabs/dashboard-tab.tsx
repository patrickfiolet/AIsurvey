'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { FileText, MessageSquare, Brain, Phone, Loader2 } from 'lucide-react'

export default function DashboardTab() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r?.json?.())
      .then(d => { setStats(d ?? {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>

  const cards = [
    { label: t('totalSurveys'), value: stats?.surveys ?? 0, icon: FileText, color: 'bg-blue-500' },
    { label: t('totalResponses'), value: stats?.responses ?? 0, icon: MessageSquare, color: 'bg-green-500' },
    { label: t('totalConversations'), value: stats?.conversations ?? 0, icon: Brain, color: 'bg-purple-500' },
    { label: t('totalVoiceCalls'), value: stats?.voiceCalls ?? 0, icon: Phone, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('dashboard')}</h2>
      <p className="text-sm text-slate-500 mb-6">{t('adminEnvironment')}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${c.color} rounded-lg flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
