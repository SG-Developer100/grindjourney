'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './mentor.module.css'

const STATUS_COPY = {
  requested: { label: 'Request sent', desc: "We got it. We'll match you with the right mentor and reach out.", color: 'var(--aqua)' },
  matched: { label: 'Mentor matched', desc: "You've been matched! We'll connect you shortly.", color: 'var(--yellow)' },
  active: { label: 'Active mentorship', desc: 'Your mentor is ready. Check your email for next steps.', color: 'var(--green)' },
}

export default function MentorPage() {
  const supabase = createClient()
  const [request, setRequest] = useState<{ status: string; note: string | null } | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('mentor_requests')
        .select('*')
        .eq('youth_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      setRequest(data)
      setFetching(false)
    }
    load()
  }, [])

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('mentor_requests').insert({
      youth_id: user.id,
      status: 'requested',
      note: note || null,
    })
    setSubmitted(true)
    setLoading(false)
    setRequest({ status: 'requested', note })
  }

  if (fetching) return <div className={styles.page}><p style={{ color: 'var(--text-muted)' }}>Loading…</p></div>

  return (
    <div className={styles.page}>
      <p className="eyebrow">Mentorship</p>
      <h1 className={styles.title}>Request a mentor</h1>
      <p className={styles.sub}>
        A mentor is someone who's been where you want to go. They'll check in on your plan,
        push you when you need it, and celebrate your wins.
      </p>

      {request ? (
        <div className={styles.statusCard}>
          <span
            className="area-badge"
            style={{
              color: STATUS_COPY[request.status as keyof typeof STATUS_COPY]?.color ?? 'var(--aqua)',
              borderColor: STATUS_COPY[request.status as keyof typeof STATUS_COPY]?.color ?? 'var(--aqua)',
              fontSize: 12,
            }}
          >
            {STATUS_COPY[request.status as keyof typeof STATUS_COPY]?.label ?? request.status}
          </span>
          <p className={styles.statusDesc}>
            {STATUS_COPY[request.status as keyof typeof STATUS_COPY]?.desc}
          </p>
        </div>
      ) : (
        <form onSubmit={handleRequest} className={styles.form}>
          <div>
            <label className="label">Anything you want your mentor to know? (optional)</label>
            <textarea
              className="input textarea"
              rows={4}
              placeholder="e.g. I want help with time management and staying motivated during school"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Sending request…' : 'Request a mentor →'}
          </button>
        </form>
      )}
    </div>
  )
}
