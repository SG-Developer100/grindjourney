import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import styles from './admin.module.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.logo}>
          <span>o</span><span className={styles.aqua}>m</span><span>g</span><span className={styles.aqua}>.</span>
        </Link>
        <span style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Admin
        </span>
        <Link href="/dashboard" className="btn btn-ghost" style={{ marginLeft: 'auto', fontSize: 12, padding: '8px 14px' }}>
          My dashboard
        </Link>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
