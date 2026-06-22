export default function StreakBadge({ streak }: { streak: number }) {
  return (
    <div style={{
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: streak > 0 ? 'rgba(87,199,255,0.12)' : 'var(--surface-3)',
      border: `2px solid ${streak > 0 ? 'var(--aqua)' : 'var(--border)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      flexShrink: 0,
    }}>
      🔥
    </div>
  )
}
