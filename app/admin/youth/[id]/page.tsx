import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import styles from '../../admin.module.css'

const AREAS = ['Athletic', 'Academic', 'Leadership', 'Wellness', 'Community', 'Personal Growth']

export default async function YouthDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  const { data: plan } = await supabase.from('success_plans').select('*').eq('user_id', id).eq('status', 'active').single()
  const { data: milestones } = plan
    ? await supabase.from('milestones').select('*').eq('plan_id', plan.id).order('sort_order')
    : { data: [] }
  const { data: mentorRequest } = await supabase.from('mentor_requests').select('*').eq('youth_id', id).order('created_at', { ascending: false }).limit(1).single()

  const total = milestones?.length ?? 0
  const done = milestones?.filter((m: { is_complete: boolean }) => m.is_complete).length ?? 0

  return (
    <div className={styles.adminPage}>
      <Link href="/admin" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
        ← All athletes
      </Link>

      <div className={styles.pageHeader}>
        <div>
          <p className="eyebrow">{profile?.sport || 'Athlete'}</p>
          <h1 className={styles.pageTitle}>{profile?.full_name}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Plan progress</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: total > 0 ? 'var(--aqua)' : 'var(--text-muted)' }}>
            {total > 0 ? `${Math.round((done / total) * 100)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Bio */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          ['Age', profile?.age ?? '—'],
          ['City', profile?.city ?? '—'],
          ['Goal', profile?.goal ?? '—'],
          ['Obstacle', profile?.barrier ?? '—'],
          ['Mentor', mentorRequest?.status ?? 'No request'],
        ].map(([label, val]) => (
          <div key={label} className="card" style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 14, color: 'var(--text-primary)' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Milestones by area */}
      {plan && (
        <div>
          <p className="eyebrow" style={{ marginBottom: 12 }}>{plan.title}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {AREAS.map((area) => {
              const items = (milestones ?? []).filter((m: { area: string }) => m.area === area)
              if (!items.length) return null
              return (
                <div key={area} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="area-badge" style={{ color: 'var(--aqua)', borderColor: 'var(--aqua)' }}>{area}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {items.filter((m: { is_complete: boolean }) => m.is_complete).length}/{items.length}
                    </span>
                  </div>
                  {items.map((m: { id: string; title: string; is_complete: boolean }) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: 16, color: m.is_complete ? 'var(--green)' : 'var(--surface-3)' }}>
                        {m.is_complete ? '✓' : '○'}
                      </span>
                      <span style={{ fontSize: 14, color: m.is_complete ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: m.is_complete ? 'line-through' : 'none' }}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!plan && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ color: 'var(--text-muted)' }}>This athlete hasn't chosen a plan yet.</p>
        </div>
      )}
    </div>
  )
}
