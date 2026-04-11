/**
 * Landing Page — AIsurvey.me v2.0
 */
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="aisurvey.me" width={40} height={40} />
            <span className="text-xl font-bold text-gray-900">aisurvey.me</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Admin
            </Link>
            <Link
              href="/survey"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Start Assessment
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
            Knowledge-OS Ecosystem
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900">
            AI-Driven{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tacit Knowledge
            </span>{' '}
            Extraction
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Capture the knowledge that lives in people&apos;s heads — before it walks out the door.
            AI-powered surveys that go beyond what, to uncover the why.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/survey"
              className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
            >
              Start Assessment
            </Link>
            <Link
              href="#features"
              className="rounded-lg border border-gray-300 px-6 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mx-auto mt-24 max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Three Modes of Knowledge Capture
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Conversational */}
            <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Conversational AI</h3>
              <p className="text-gray-600">
                Intelligent chatbot with the Why-Protocol — probes for decision context,
                workarounds, and exceptions that standard surveys miss.
              </p>
            </div>

            {/* Voice */}
            <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Voice Agent</h3>
              <p className="text-gray-600">
                VAPI-powered phone interviews — perfect for senior experts who prefer
                talking over typing. Automatic transcription and analysis.
              </p>
            </div>

            {/* Static */}
            <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Static Survey</h3>
              <p className="text-gray-600">
                Traditional form-based questionnaires for structured data collection.
                Supports multiple question types and multi-language.
              </p>
            </div>
          </div>
        </div>

        {/* v2.0 Features */}
        <div className="mx-auto mt-24 max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            v2.0 — Tacit Knowledge Focus
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border bg-white p-6">
              <h4 className="mb-2 font-semibold text-blue-700">🧠 Why-Protocol</h4>
              <p className="text-sm text-gray-600">
                AI probes for decision context, workarounds, and exceptions —
                the tacit knowledge that lives in people&apos;s heads.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6">
              <h4 className="mb-2 font-semibold text-blue-700">🎯 Domain Templates</h4>
              <p className="text-sm text-gray-600">
                SAP, Healthcare, IT Operations, Government — domain-specific
                question sets optimized for maximum tacit knowledge yield.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6">
              <h4 className="mb-2 font-semibold text-blue-700">📊 Tacit Knowledge Score</h4>
              <p className="text-sm text-gray-600">
                Measure and visualize how much implicit vs. explicit knowledge
                was captured. Track ROI of knowledge retention efforts.
              </p>
            </div>
            <div className="rounded-xl border bg-white p-6">
              <h4 className="mb-2 font-semibold text-blue-700">🔗 Knowledge Graph</h4>
              <p className="text-sm text-gray-600">
                Connect people, processes, systems, and decisions into a
                searchable, visual knowledge network.
              </p>
            </div>
          </div>
        </div>

        {/* Ecosystem */}
        <div className="mx-auto mt-24 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Part of Knowledge-OS</h2>
          <p className="mb-8 text-gray-600">
            AIsurvey.me works together with EDI (Enterprise Documentation Intelligence) and
            learning.me to create a complete knowledge retention ecosystem.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm font-medium">
            <span className="rounded-lg bg-blue-100 px-3 py-1 text-blue-700">aisurvey.me</span>
            <span className="text-gray-400">↔</span>
            <span className="rounded-lg bg-green-100 px-3 py-1 text-green-700">EDI</span>
            <span className="text-gray-400">↔</span>
            <span className="rounded-lg bg-purple-100 px-3 py-1 text-purple-700">learning.me</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Filos-IT B.V. — knowledge-os.net</p>
          <p className="mt-1">AIsurvey.me v2.0 — Tacit Knowledge Extraction Platform</p>
        </div>
      </footer>
    </div>
  )
}
