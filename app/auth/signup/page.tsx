'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from '../auth.module.css'

const STEPS = [
  {
    key: 'basics',
    title: "Let's start with you",
    sub: 'Tell us your name and age.',
  },
  {
    key: 'sport',
    title: 'What sport do you play?',
    sub: 'Be specific — "tennis," "basketball," "track."',
  },
  {
    key: 'goal',
    title: "What's your #1 goal right now?",
    sub: "One thing you're grinding toward.",
  },
  {
    key: 'barrier',
    title: "What's getting in the way?",
    sub: "Your biggest obstacle. Be real with us.",
  },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    age: '',
    sport: '',
    goal: '',
    barrier: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (step < STEPS.length) {
      setStep((s) => s + 1)
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: form.full_name,
      age: parseInt(form.age) || null,
      sport: form.sport,
      goal: form.goal,
      barrier: form.barrier,
      role: 'youth',
      stage: 'Participant',
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const isLastStep = step === STEPS.length

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {!isLastStep ? (
          <>
            {/* Step indicator */}
            <div className={styles.steps}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`${styles.stepDot} ${i <= step ? styles.stepActive : ''}`}
                />
              ))}
            </div>

            <div className={styles.logo}>
              <span>o</span>
              <span className={styles.aqua}>m</span>
              <span>g</span>
              <span className={styles.aqua}>.</span>
            </div>

            <h1 className={styles.heading}>{STEPS[step].title}</h1>
            <p className={styles.sub}>{STEPS[step].sub}</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              {step === 0 && (
                <>
                  <div>
                    <label className="label">Full name</label>
                    <input className="input" placeholder="Your name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Age</label>
                    <input className="input" type="number" placeholder="e.g. 15" min="8" max="25" value={form.age} onChange={(e) => update('age', e.target.value)} required />
                  </div>
                </>
              )}

              {step === 1 && (
                <div>
                  <label className="label">Sport</label>
                  <input className="input" placeholder="e.g. Tennis" value={form.sport} onChange={(e) => update('sport', e.target.value)} required />
                </div>
              )}

              {step === 2 && (
                <div>
                  <label className="label">Your #1 goal</label>
                  <textarea className="textarea input" placeholder="e.g. Make varsity this season" rows={3} value={form.goal} onChange={(e) => update('goal', e.target.value)} required />
                </div>
              )}

              {step === 3 && (
                <div>
                  <label className="label">Biggest obstacle</label>
                  <textarea className="textarea input" placeholder="e.g. I get distracted and lose focus in practice" rows={3} value={form.barrier} onChange={(e) => update('barrier', e.target.value)} required />
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {step < STEPS.length - 1 ? 'Next →' : 'Last step →'}
              </button>

              {step > 0 && (
                <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setStep((s) => s - 1)}>
                  ← Back
                </button>
              )}
            </form>
          </>
        ) : (
          <>
            <div className={styles.logo}>
              <span>o</span>
              <span className={styles.aqua}>m</span>
              <span>g</span>
              <span className={styles.aqua}>.</span>
            </div>

            <h1 className={styles.heading}>Create your login</h1>
            <p className={styles.sub}>One last step — set up your email and password.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="you@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="8+ characters" minLength={8} value={form.password} onChange={(e) => update('password', e.target.value)} required />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Creating account…' : "Let's go →"}
              </button>

              <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setStep((s) => s - 1)}>
                ← Back
              </button>
            </form>
          </>
        )}

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href="/auth/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
