import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StreakBadge from '@/components/ui/StreakBadge'
import ProgressRing from '@/components/ui/ProgressRing'
import styles from './dashboard.module.css'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get active plan
  const { data: plan } = await supabase
    .from('success_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  // Get milestones
  const milestones = plan
    ? (await supabase.from('milestones').select('*').eq('plan_id', plan.id)).data ?? []
    : []

  const total = milestones.length
  const completed = milestones.filter((m: { is_complete: boolean }) => m.is_complete).length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  // Compute streak from check_ins
  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('date')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(30)

  let streak = 0
  if (checkIns && checkIns.length > 0) {
    const today = new Date().toISOString().split('T')[0]
    const dates = checkIns.map((c: { date: string }) => c.date)
    let cursor = today
    for (const date of dates) {
      if (date === cursor) {
        streak++
        const d = new Date(cursor)
        d.setDate(d.getDate() - 1)
        cursor = d.toISOString().split('T')[0]
      } else break
    }
  }

  // Find first incomplete milestone
  const nextMilestone = milestones.find((m: { is_complete: boolean }) => !m.is_complete)

  // Get mentor request status
  const { data: mentorRequest } = await supabase
    .from('mentor_requests')
    .select('*')
    .eq('youth_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className={styles.page}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <p className="eyebrow">Your grind</p>
        <h1 className={styles.name}>
          {profile?.full_name?.split(' ')[0] ?? 'Athlete'}
        </h1>
      </div>

      {/* Stats row */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <ProgressRing percent={percent} size={72} />
          <div>
            <p className={styles.statLabel}>Plan complete</p>
            <p className={styles.statValue}>{percent}%</p>
            <p className={styles.statSub}>{completed}/{total} done</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <StreakBadge streak={streak} />
          <div>
            <p className={styles.statLabel}>Day streak</p>
            <p className={styles.statValue}>{streak}</p>
            <p className={styles.statSub}>{streak > 0 ? 'Keep it going' : 'Start today'}</p>
          </div>
        </div>
      </div>

      {/* Next up */}
      {nextMilestone && (
        <div className={styles.section}>
          <p className="eyebrow">Next step</p>
          <Link href="/dashboard/plan" className={styles.nextCard}>
            <span className="area-badge" style={{ color: 'var(--aqua)', borderColor: 'var(--aqua)' }}>
              {nextMilestone.area}
            </span>
            <p className={styles.nextTitle}>{nextMilestone.title}</p>
            <span className={styles.arrow}>→</span>
          </Link>
        </div>
      )}

      {!plan && (
        <div className={styles.section}>
          <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              You don't have a Success Plan yet.
            </p>
            <Link href="/dashboard/plan" className="btn btn-primary">
              Pick a plan →
            </Link>
          </div>
        </div>
      )}

      {/* Mentor */}
      <div className={styles.section}>
        <p className="eyebrow">Mentor</p>
        <div className="card">
          {!mentorRequest && (
            <>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Connect with a mentor who can guide your journey.
              </p>
              <Link href="/dashboard/mentor" className="btn btn-ghost" style={{ width: '100%' }}>
                Request a mentor
              </Link>
            </>
          )}
          {mentorRequest && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Mentor request</span>
              <span
                className="area-badge"
                style={{
                  color: mentorRequest.status === 'active' ? 'var(--green)' : 'var(--aqua)',
                  borderColor: mentorRequest.status === 'active' ? 'var(--green)' : 'var(--aqua)',
                  textTransform: 'capitalize',
                }}
              >
                {mentorRequest.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
