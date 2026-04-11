// Renders a single step of an interactive knot diagram.
// Active segment gets a glow and full opacity.
// Non-active visible segments are rendered at reduced opacity (they exist but aren't the focus).
// Segments not in `visible` are not rendered at all.

export default function KnotSVG({ knot, step: stepIndex }) {
  const step = knot.steps[stepIndex]
  const { visible, active, showLabels } = step

  // Render non-active segments first so the active one always sits on top
  const behind = knot.segments.filter(s => visible.includes(s.id) && !active.includes(s.id))
  const front  = knot.segments.filter(s => visible.includes(s.id) &&  active.includes(s.id))

  return (
    <svg
      viewBox={knot.viewBox}
      style={{ width: '100%', maxWidth: '300px', display: 'block' }}
      aria-label={`Bowline knot — ${step.label}`}
    >
      <defs>
        {/* Glow filter applied to the active segment */}
        <filter id="knot-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="100%" height="100%" rx="12" fill="#f0f4f8" />

      {/* Behind: existing rope elements, de-emphasised */}
      {behind.map(seg => (
        <path
          key={seg.id}
          d={seg.d}
          stroke={seg.stroke}
          strokeWidth={seg.sw}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.35}
        />
      ))}

      {/* Front: active segment — highlighted */}
      {front.map(seg => (
        <path
          key={seg.id}
          d={seg.d}
          stroke={seg.stroke}
          strokeWidth={seg.sw + 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={1}
          filter="url(#knot-glow)"
        />
      ))}

      {/* Anatomy labels */}
      {knot.labels
        .filter(lbl => showLabels.includes(lbl.id))
        .map(lbl => (
          <text
            key={lbl.id}
            x={lbl.x}
            y={lbl.y}
            fontSize="9.5"
            fill={lbl.color}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="500"
          >
            {lbl.text}
          </text>
        ))}
    </svg>
  )
}
