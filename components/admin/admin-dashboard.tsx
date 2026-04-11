'use client'

/**
 * Admin Dashboard Component — v2.0
 * Tabs: Surveys, Questions, Responses, Analysis, Voice Agent,
 *       Translations, Knowledge Graph, Expert Profiles, Tacit Score,
 *       Users, Settings
 */
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { SurveysManager } from './surveys-manager'
import { ResponsesViewer } from './responses-viewer'
import { TacitScoreDashboard } from './tacit-score-dashboard'

const tabs = [
  { id: 'surveys', label: 'Surveys', icon: '📋' },
  { id: 'responses', label: 'Responses', icon: '💬' },
  { id: 'analysis', label: 'Analysis', icon: '🧠' },
  { id: 'tacit-score', label: 'Tacit Score', icon: '📊' },
  { id: 'knowledge-graph', label: 'Knowledge Graph', icon: '🔗' },
  { id: 'expert-profiles', label: 'Expert Profiles', icon: '👤' },
  { id: 'voice-agent', label: 'Voice Agent', icon: '🎙️' },
  { id: 'translations', label: 'Translations', icon: '🌐' },
  { id: 'integration', label: 'Integration', icon: '↔️' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('surveys')

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <Image src="/logo.png" alt="aisurvey.me" width={32} height={32} />
          <div>
            <div className="text-sm font-bold">aisurvey.me</div>
            <div className="text-xs text-gray-500">v2.0 Admin</div>
          </div>
        </div>

        <nav className="p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            🚶 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          {activeTab === 'surveys' && <SurveysManager />}
          {activeTab === 'responses' && <ResponsesViewer />}
          {activeTab === 'analysis' && <AnalysisPlaceholder />}
          {activeTab === 'tacit-score' && <TacitScoreDashboard />}
          {activeTab === 'knowledge-graph' && <PlaceholderTab title="Knowledge Graph" description="Visual knowledge graph explorer with nodes, edges, and 'what if' scenarios. Connect people, processes, systems, and decisions." />}
          {activeTab === 'expert-profiles' && <PlaceholderTab title="Expert Profiles" description="Multi-session knowledge dossiers per expert. Track knowledge domains, risk levels, and session history." />}
          {activeTab === 'voice-agent' && <PlaceholderTab title="Voice Agent" description="VAPI voice agent management. View calls, transcripts, extracted answers, and costs." />}
          {activeTab === 'translations' && <PlaceholderTab title="Translations" description="Manage translations for surveys, questions, and dynamic content across 7 languages." />}
          {activeTab === 'integration' && <PlaceholderTab title="Knowledge-OS Integration" description="Monitor integration status with EDI and learning.me. View event logs and configuration." />}
          {activeTab === 'users' && <PlaceholderTab title="User Management" description="Manage admin users, roles (Admin, Editor, Viewer), and permissions." />}
          {activeTab === 'settings' && <PlaceholderTab title="Settings" description="Application settings, theme configuration, and system preferences." />}
        </div>
      </main>
    </div>
  )
}

function AnalysisPlaceholder() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">AI Analysis</h2>
      <p className="text-gray-600">
        Consolidated AI analysis across static responses, conversational data, and voice agent calls.
        Includes streaming analysis, saved analyses, free prompt, and export to Excel/PDF.
      </p>
      <div className="rounded-xl border bg-white p-6">
        <p className="text-gray-500 text-center py-8">
          Select a survey to generate AI analysis. Analysis is streamed in real-time using GPT-4o.
        </p>
      </div>
    </div>
  )
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-gray-600">{description}</p>
      <div className="rounded-xl border bg-white p-8 text-center">
        <p className="text-gray-400">Component implementation ready — connect to API endpoints.</p>
      </div>
    </div>
  )
}
