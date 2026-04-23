'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/lib/language-context'
import { Loader2, Plus, Trash2, Edit2, Save, X, Users, Shield, ShieldCheck, Eye } from 'lucide-react'

export default function UsersTab() {
  const { data: session } = useSession() || {}
  const { t } = useLanguage()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'VIEWER' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const loadUsers = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/users').then(r => r?.json?.()).then(d => { setUsers(d ?? []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  const showMsg = (msg: string, type: 'success' | 'error') => {
    setMessage(msg); setMessageType(type)
    setTimeout(() => setMessage(''), 4000)
  }

  const createUser = async () => {
    if (!form.email || !form.password) { showMsg(t('emailPasswordRequired'), 'error'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data?.error) { showMsg(data.error, 'error') }
      else { showMsg(t('userCreated'), 'success'); setShowCreate(false); resetForm(); loadUsers() }
    } catch { showMsg(t('errorCreatingUser'), 'error') }
    finally { setSaving(false) }
  }

  const updateUser = async () => {
    if (!editingId) return
    setSaving(true)
    try {
      const body: any = { id: editingId, name: form.name, role: form.role }
      if (form.email) body.email = form.email
      if (form.password) body.password = form.password
      const res = await fetch('/api/admin/users', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data?.error) { showMsg(data.error, 'error') }
      else { showMsg(t('userUpdated'), 'success'); setEditingId(null); resetForm(); loadUsers() }
    } catch { showMsg(t('errorUpdatingUser'), 'error') }
    finally { setSaving(false) }
  }

  const deleteUser = async (id: number) => {
    if (!confirm(t('confirmDeleteUser'))) return
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data?.error) { showMsg(data.error, 'error') }
      else { showMsg(t('userDeleted'), 'success'); loadUsers() }
    } catch { showMsg(t('errorDeletingUser'), 'error') }
  }

  const startEdit = (user: any) => {
    setEditingId(user.id)
    setForm({ email: user.email, password: '', name: user.name || '', role: user.role })
    setShowCreate(false)
  }

  const resetForm = () => { setForm({ email: '', password: '', name: '', role: 'VIEWER' }) }

  const roleIcon = (role: string) => {
    if (role === 'ADMIN') return <ShieldCheck className="w-3.5 h-3.5" />
    if (role === 'EDITOR') return <Shield className="w-3.5 h-3.5" />
    return <Eye className="w-3.5 h-3.5" />
  }

  const roleColor = (role: string) => {
    if (role === 'ADMIN') return 'bg-red-100 text-red-700'
    if (role === 'EDITOR') return 'bg-blue-100 text-blue-700'
    return 'bg-slate-100 text-slate-700'
  }

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t('userManagement')}</h2>
          <p className="text-sm text-slate-500">{t('manageUsersAndRoles')}</p>
        </div>
        <button onClick={() => { setShowCreate(true); setEditingId(null); resetForm() }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> {t('newUser')}
        </button>
      </div>

      {message && <div className={`${messageType === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} border rounded-lg px-4 py-2 text-sm mb-4`}>{message}</div>}

      {/* Roles explanation */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
        <p className="text-xs font-medium text-slate-600 mb-2">{t('rolesExplanation')}</p>
        <div className="flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-red-500" /> ADMIN: {t('adminRoleDesc')}</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-500" /> EDITOR: {t('editorRoleDesc')}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-slate-400" /> VIEWER: {t('viewerRoleDesc')}</span>
        </div>
      </div>

      {/* Create/Edit form */}
      {(showCreate || editingId) && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-4">{editingId ? t('editUser') : t('createUser')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t('email')}</label>
              <input value={form.email} onChange={(e: any) => setForm(f => ({ ...f, email: e?.target?.value ?? '' }))} placeholder="user@example.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t('passwordLabel')} {editingId && <span className="text-slate-400">({t('optionalLabel')})</span>}</label>
              <input type="password" value={form.password} onChange={(e: any) => setForm(f => ({ ...f, password: e?.target?.value ?? '' }))} placeholder="••••••••" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t('nameLabel')} <span className="text-slate-400">({t('optionalLabel')})</span></label>
              <input value={form.name} onChange={(e: any) => setForm(f => ({ ...f, name: e?.target?.value ?? '' }))} placeholder="John Doe" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t('roleLabel')}</label>
              <select value={form.role} onChange={(e: any) => setForm(f => ({ ...f, role: e?.target?.value ?? 'VIEWER' }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="VIEWER">{t('viewerReadOnly')}</option>
                <option value="EDITOR">{t('editorCreateEdit')}</option>
                <option value="ADMIN">{t('adminFullAccess')}</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={editingId ? updateUser : createUser} disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editingId ? t('update') : t('create')}
            </button>
            <button onClick={() => { setShowCreate(false); setEditingId(null); resetForm() }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm">{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">{t('userColumn')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">{t('roleColumn')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">{t('createdColumn')}</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">{t('actionsColumn')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                      {(u.name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{u.name || '-'}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${roleColor(u.role)}`}>
                    {roleIcon(u.role)} {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(u)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600" title={t('editUser')}><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500" title={t('deleteUser')} disabled={(session as any)?.user?.email === u.email}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-slate-500 py-8">{t('noUsersFound')}</p>}
      </div>
    </div>
  )
}
