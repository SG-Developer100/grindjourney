'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './NavBar.module.css'

const NAV = [
  { href: '/dashboard', label: 'Home', icon: '⌂' },
  { href: '/dashboard/plan', label: 'My Plan', icon: '☑' },
  { href: '/dashboard/mentor', label: 'Mentor', icon: '◈' },
  { href: '/dashboard/profile', label: 'Profile', icon: '◉' },
]

export default function NavBar({ profile }: { profile: { role?: string; full_name?: string } | null }) {
  const path = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span>o</span><span className={styles.aqua}>m</span><span>g</span><span className={styles.aqua}>.</span>
        </div>

        <div className={styles.sidebarLinks}>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`${styles.sidebarLink} ${path === n.href ? styles.active : ''}`}
            >
              <span className={styles.icon}>{n.icon}</span>
              {n.label}
            </Link>
          ))}

          {profile?.role === 'admin' && (
            <Link href="/admin" className={styles.sidebarLink}>
              <span className={styles.icon}>⊞</span>
              Admin
            </Link>
          )}
        </div>

        {profile?.full_name && (
          <div className={styles.sidebarUser}>
            <span className={styles.avatar}>
              {profile.full_name.charAt(0).toUpperCase()}
            </span>
            <span className={styles.userName}>{profile.full_name.split(' ')[0]}</span>
          </div>
        )}
      </nav>

      {/* Mobile bottom bar */}
      <nav className={styles.mobileBar}>
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`${styles.mobileLink} ${path === n.href ? styles.mobileActive : ''}`}
          >
            <span className={styles.mobileIcon}>{n.icon}</span>
            <span className={styles.mobileLabel}>{n.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
