'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './profile.module.css'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      full_name: profile.full_name,
      age: parseInt(profile.age) || null,
      sport: profile.sport,
      goal: profile.goal,
      barrier: profile.barrier,
      city: profile.city,
    }).eq('id', user.id)
    setSaved(true)
    setLoading(false)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function update(k: string, v: string) {
    setProfile((p) => ({ ...p, [k]: v }))
  }

  return (
    <div className={styles.page}>
      <p className="eyebrow">Your info</p>
      <h1 className={styles.title}>Profile</h1>

      <form onSubmit={handleSave} className={styles.form}>
        <div>
          <label className="label">Full name</label>
          <input className="input" value={profile.full_name ?? ''} onChange={(e) => update('full_name', e.target.value)} />
        </div>
        <div>
          <label className="label">Age</label>
          <input className="input" type="number" value={profile.age ?? ''} onChange={(e) => update('age', e.target.value)} />
        </div>
        <div>
          <label className="label">Sport</label>
          <input className="input" value={profile.sport ?? ''} onChange={(e) => update('sport', e.target.value)} />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" placeholder="e.g. Orlando, FL" value={profile.city ?? ''} onChange={(e) => update('city', e.target.value)} />
        </div>
        <div>
          <label className="label">#1 Goal</label>
          <textarea className="input textarea" rows={2} value={profile.goal ?? ''} onChange={(e) => update('goal', e.target.value)} />
        </div>
        <div>
          <label className="label">Biggest obstacle</label>
          <textarea className="input textarea" rows={2} value={profile.barrier ?? ''} onChange={(e) => update('barrier', e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {saved ? '✓ Saved' : loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className={styles.danger}>
        <button onClick={handleSignOut} className="btn btn-ghost" style={{ width: '100%' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
