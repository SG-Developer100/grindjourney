import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MilestoneList from '@/components/ui/MilestoneList'
import PlanPicker from '@/components/ui/PlanPicker'
import styles from './plan.module.css'
import type { SuccessPlanArea } from '@/types'

const AREA_ORDER: SuccessPlanArea[] = [
  'Athletic', 'Academic', 'Leadership', 'Wellness', 'Community', 'Personal Growth',
]

const AREA_COLORS: Record<SuccessPlanArea, string> = {
  Athletic: '#57C7FF',
  Academic: '#34c759',
  Leadership: '#ffd60a',
  Wellness: '#bf5af2',
  Community: '#ff9f0a',
  'Personal Growth': '#ff5d5d',
}

export default async function PlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: plan } = await supabase
    .from('success_plans')
    .select('*, plan_templates(name, description)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const { data: templates } = await supabase
    .from('plan_templates')
    .select('*')

  if (!plan) {
    return (
      <div className={styles.page}>
        <p className="eyebrow">Success Plan</p>
        <h1 className={styles.title}>Pick your plan</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          Choose a foundation to build on. Your milestones will be created automatically.
        </p>
        <PlanPicker templates={templates ?? []} userId={user.id} />
      </div>
    )
  }

  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('plan_id', plan.id)
    .order('sort_order')

  const byArea = AREA_ORDER.reduce((acc, area) => {
    acc[area] = (milestones ?? []).filter((m: { area: string }) => m.area === area)
    return acc
  }, {} as Record<SuccessPlanArea, typeof milestones>)

  const total = milestones?.length ?? 0
  const completed = milestones?.filter((m: { is_complete: boolean }) => m.is_complete).length ?? 0

  return (
    <div className={styles.page}>
      <p className="eyebrow">Success Plan</p>
      <h1 className={styles.title}>{plan.title}</h1>
      {plan.plan_templates && (
        <p className={styles.sub}>{plan.plan_templates.description}</p>
      )}

      {/* Overall progress */}
      <div className={styles.overallBar}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Overall</span>
          <span style={{ fontSize: 12, color: 'var(--aqua)' }}>{completed}/{total}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Areas */}
      <div className={styles.areas}>
        {AREA_ORDER.map((area) => {
          const items = byArea[area] ?? []
          if (items.length === 0) return null
          const done = items.filter((m: { is_complete: boolean }) => m.is_complete).length
          return (
            <div key={area} className={styles.areaSection}>
              <div className={styles.areaHeader}>
                <span
                  className="area-badge"
                  style={{ color: AREA_COLORS[area], borderColor: AREA_COLORS[area] }}
                >
                  {area}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{done}/{items.length}</span>
              </div>
              <MilestoneList milestones={items} planId={plan.id} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
