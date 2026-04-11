/**
 * Dynamic Content Translation with MD5 Cache
 * POST /api/admin/translate-dynamic
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { translateDynamicContent } from '@/lib/translations'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { text, targetLanguage, sourceLanguage = 'nl' } = await request.json()
    const result = await translateDynamicContent(text, targetLanguage, sourceLanguage)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Dynamic translation error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
