'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/language-context'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function AdminLoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', { redirect: false, email, password })
      if (result?.error) {
        setError(t('loginError'))
      } else {
        router.replace('/admin')
      }
    } catch {
      setError(t('loginError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-16 h-16 mb-3">
            <Image src="/logo.png" alt="AIsurvey.me" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">AIsurvey.me</h1>
          <span className="text-xs text-purple-600 font-semibold">v3.0</span>
          <p className="text-slate-500 mt-2 text-sm">{t('adminLogin')}</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="email" value={email} onChange={(e: any) => setEmail(e?.target?.value ?? '')}
              placeholder={t('email')} required
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type={showPass ? 'text' : 'password'} value={password} onChange={(e: any) => setPassword(e?.target?.value ?? '')}
              placeholder={t('password')} required
              className="w-full pl-11 pr-11 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            {loading ? t('loading') : t('login')}
          </button>
        </form>
      </div>
    </div>
  )
}
