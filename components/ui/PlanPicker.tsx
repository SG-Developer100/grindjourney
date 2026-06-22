'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './PlanPicker.module.css'

interface Template {
  id: string
  name: string
  description: string | null
}

export default function PlanPicker({ templates, userId }: { templates: Template[]; userId: string }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    if (!selected) return
    setLoading(true)
    const supabase = createClient()
    const template = templates.find((t) => t.id === selected)

    // Create the plan
    const { data: plan } = await supabase.from('success_plans').insert({
      user_id: userId,
      template_id: selected,
      title: template?.name ?? 'My Success Plan',
      status: 'active',
    }).select().single()

    if (plan) {
      // Seed milestones from template
      await supabase.rpc('seed_milestones_from_template', {
        p_plan_id: plan.id,
        p_template_id: selected,
      })
    }

    router.push('/dashboard/plan')
    router.refresh()
  }

  return (
    <div className={styles.picker}>
      {templates.map((t) => (
        <button
          key={t.id}
          className={`${styles.card} ${selected === t.id ? styles.selected : ''}`}
          onClick={() => setSelected(t.id)}
        >
          <div className={styles.check}>
            {selected === t.id ? '●' : '○'}
          </div>
          <div>
            <p className={styles.name}>{t.name}</p>
            {t.description && <p className={styles.desc}>{t.description}</p>}
          </div>
        </button>
      ))}

      <button
        className="btn btn-primary"
        disabled={!selected || loading}
        onClick={handleStart}
        style={{ width: '100%', marginTop: 8 }}
      >
        {loading ? 'Building your plan…' : 'Start this plan →'}
      </button>
    </div>
  )
}
