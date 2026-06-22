import Link from 'next/link'
import styles from './page.module.css'

export default function LandingPage() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Grind Journey</p>

        <div className={styles.mark}>
          <span>o</span>
          <span className={styles.aqua}>m</span>
          <span>g</span>
          <span className={styles.aqua}>.</span>
        </div>

        <p className={styles.fullName}>Own My Grind</p>

        <p className={styles.tagline}>
          A personalized Success Plan for athletes who want to grow
          on the court, in the classroom, and in life.
        </p>

        <div className={styles.actions}>
          <Link href="/auth/signup" className="btn btn-primary">
            Start your journey
          </Link>
          <Link href="/auth/login" className="btn btn-ghost">
            Sign in
          </Link>
        </div>
      </div>

      {/* Six areas */}
      <div className={styles.areas}>
        {[
          ['Athletic', 'Build your skills on the court and in the gym.'],
          ['Academic', 'Own your grades and your time.'],
          ['Leadership', 'Show up. Step up. Bring others with you.'],
          ['Wellness', 'Sleep, water, and mental reset — the basics matter.'],
          ['Community', 'Give back to the game and your neighborhood.'],
          ['Personal Growth', "Know who you are and where you're going."],
        ].map(([area, desc]) => (
          <div key={area} className={styles.areaCard}>
            <span className={styles.areaName}>{area}</span>
            <p className={styles.areaDesc}>{desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
