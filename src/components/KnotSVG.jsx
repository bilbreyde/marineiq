// Renders a single step of an interactive knot diagram.
// Active segment: full opacity + glow. Non-active visible: 35% opacity. Hidden: not rendered.
// Fixed elements (post, ring, cleat body, loaded line) are always rendered under the rope.

function FixedEl({ el, i }) {
  const shared = {
    key: i,
    fill: el.fill ?? 'none',
    stroke: el.stroke ?? 'none',
    strokeWidth: el.strokeWidth ?? 0,
    strokeLinecap: el.strokeLinecap ?? 'butt',
  }
  if (el.type === 'rect')
    return <rect {...shared} x={el.x} y={el.y} width={el.width} height={el.height} rx={el.rx ?? 0} />
  if (el.type === 'circle')
    return <circle {...shared} cx={el.cx} cy={el.cy} r={el.r} />
  if (el.type === 'ellipse')
    return <ellipse {...shared} cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} />
  if (el.type === 'line')
    return <line {...shared} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} />
  return null
}

export default function KnotSVG({ knot, step: stepIndex }) {
  const step = knot.steps[stepIndex]
  const { visible, active, showLabels } = step

  // Two-pass render: non-active behind, active on top
  const behind = knot.segments.filter(s => visible.includes(s.id) && !active.includes(s.id))
  const front  = knot.segments.filter(s => visible.includes(s.id) &&  active.includes(s.id))

  return (
    <svg
      viewBox={knot.viewBox}
      style={{ width: '100%', maxWidth: '300px', display: 'block' }}
      aria-label={`${knot.id} — ${step.label}`}
    >
      <defs>
        <filter id="knot-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="100%" height="100%" rx="12" fill="#f0f4f8" />

      {/* Always-visible structural elements */}
      {(knot.fixed ?? []).map((el, i) => <FixedEl key={i} el={el} i={i} />)}

      {/* Existing rope — de-emphasised */}
      {behind.map(seg => (
        <path
          key={seg.id}
          d={seg.d}
          stroke={seg.stroke}
          strokeWidth={seg.sw}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={seg.dash}
          fill="none"
          opacity={0.35}
        />
      ))}

      {/* Active segment — highlighted */}
      {front.map(seg => (
        <path
          key={seg.id}
          d={seg.d}
          stroke={seg.stroke}
          strokeWidth={seg.sw + 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={seg.dash}
          fill="none"
          opacity={1}
          filter="url(#knot-glow)"
        />
      ))}

      {/* Anatomy labels */}
      {(knot.labels ?? [])
        .filter(lbl => showLabels.includes(lbl.id))
        .map(lbl => (
          <text
            key={lbl.id}
            x={lbl.x} y={lbl.y}
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
