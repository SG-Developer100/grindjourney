'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './MilestoneList.module.css'

interface Milestone {
  id: string
  plan_id: string
  title: string
  description: string | null
  is_complete: boolean
  area: string
}

export default function MilestoneList({
  milestones: initial,
  planId,
}: {
  milestones: Milestone[]
  planId: string
}) {
  const router = useRouter()
  const [milestones, setMilestones] = useState(initial)

  async function toggle(m: Milestone) {
    const supabase = createClient()
    const now = new Date().toISOString()
    const next = !m.is_complete

    setMilestones((ms) => ms.map((x) => x.id === m.id ? { ...x, is_complete: next } : x))

    await supabase.from('milestones').update({
      is_complete: next,
      completed_at: next ? now : null,
    }).eq('id', m.id)

    // Record check-in on first completion
    if (next) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const today = now.split('T')[0]
        await supabase.from('check_ins').upsert({ user_id: user.id, date: today }, { onConflict: 'user_id,date' })
      }
    }

    router.refresh()
  }

  return (
    <div className={styles.list}>
      {milestones.map((m) => (
        <button
          key={m.id}
          onClick={() => toggle(m)}
          className={`${styles.item} ${m.is_complete ? styles.done : ''}`}
        >
          <span className={styles.check}>
            {m.is_complete ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8.5" fill="var(--aqua)" stroke="var(--aqua)" />
                <path d="M5 9l3 3 5-5" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8.5" stroke="var(--border)" strokeWidth="1" />
              </svg>
            )}
          </span>
          <span className={styles.text}>
            <span className={styles.title}>{m.title}</span>
            {m.description && <span className={styles.desc}>{m.description}</span>}
          </span>
        </button>
      ))}
    </div>
  )
}
