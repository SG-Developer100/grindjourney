export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-0)',
      padding: 24,
      textAlign: 'center',
      gap: 16,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 72,
        textTransform: 'lowercase',
        lineHeight: 0.9,
        color: 'var(--bone)',
      }}>
        <span>o</span>
        <span style={{ color: 'var(--aqua)' }}>m</span>
        <span>g</span>
        <span style={{ color: 'var(--aqua)' }}>.</span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 280 }}>
        You&apos;re offline. Connect to the internet to access your Grind Journey.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn btn-primary"
        style={{ marginTop: 8 }}
      >
        Try again
      </button>
    </div>
  )
}
