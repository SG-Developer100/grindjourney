import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import styles from './admin.module.css'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: youth } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'youth')
    .order('created_at', { ascending: false })

  // Fetch all plans for those youth
  const youthIds = (youth ?? []).map((y: { id: string }) => y.id)
  const { data: plans } = youthIds.length
    ? await supabase.from('success_plans').select('*').in('user_id', youthIds).eq('status', 'active')
    : { data: [] }

  const { data: milestones } = plans && plans.length
    ? await supabase.from('milestones').select('plan_id, is_complete').in('plan_id', plans.map((p: { id: string }) => p.id))
    : { data: [] }

  function getPlanProgress(userId: string) {
    const plan = plans?.find((p: { user_id: string }) => p.user_id === userId)
    if (!plan) return null
    const ms = milestones?.filter((m: { plan_id: string }) => m.plan_id === plan.id) ?? []
    const done = ms.filter((m: { is_complete: boolean }) => m.is_complete).length
    return { total: ms.length, done, percent: ms.length > 0 ? Math.round((done / ms.length) * 100) : 0 }
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <div>
          <p className="eyebrow">Grind Journey</p>
          <h1 className={styles.pageTitle}>All athletes</h1>
        </div>
        <div className={styles.count}>{youth?.length ?? 0} youth</div>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Name</span>
          <span>Sport</span>
          <span>Age</span>
          <span>Plan progress</span>
          <span></span>
        </div>

        {(youth ?? []).length === 0 && (
          <div className={styles.empty}>No youth signed up yet.</div>
        )}

        {(youth ?? []).map((y: { id: string; full_name: string; sport: string; age: number }) => {
          const progress = getPlanProgress(y.id)
          return (
            <div key={y.id} className={styles.row}>
              <span className={styles.rowName}>{y.full_name}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{y.sport || '—'}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{y.age || '—'}</span>
              <span>
                {progress ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-bar-fill" style={{ width: `${progress.percent}%` }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 32 }}>{progress.percent}%</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No plan</span>
                )}
              </span>
              <span>
                <Link href={`/admin/youth/${y.id}`} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
                  View →
                </Link>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
