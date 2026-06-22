export default function ProgressRing({ percent, size = 64 }: { percent: number; size?: number }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth="3" />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke="var(--aqua)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  )
}
