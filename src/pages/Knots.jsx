import { useState } from 'react'
import KnotViewer from '../components/KnotViewer'
import { bowlineKnot } from '../knots/bowline'

const KNOTS = [
  {
    id: 'bowline',
    name: 'Bowline',
    use: 'Forms a fixed loop that will not slip — securing a line to a cleat, attaching a jib sheet to a sail, or making a rescue loop.',
    difficulty: 'Intermediate',
    steps: [
      'Make a small overhand loop in the standing part of the line, with the tail coming up through it.',
      'Pass the tail up through the loop (the rabbit comes out of the hole).',
      'Take the tail around behind the standing part (the rabbit goes around the tree).',
      'Pass the tail back down through the loop (the rabbit goes back in the hole).',
      'Pull tight, keeping the small loop closed.',
    ],
    tip: "The bowline is the king of sailing knots — it makes a loop that holds under load but won't jam. Learn this one before anything else.",
    svg: BowlineSVG,
    tag: 'Essential',
    interactive: bowlineKnot,
  },
  {
    id: 'cleat-hitch',
    name: 'Cleat Hitch',
    use: 'Securing a dock line or halyard to a horn cleat.',
    difficulty: 'Beginner',
    steps: [
      'Take a full round turn around the base of the cleat.',
      'Cross over to the far horn with a diagonal wrap.',
      'Cross back over to the near horn in the opposite direction (figure-eight pattern).',
      'Finish with a locking hitch: twist the line so it crosses under itself on the final wrap.',
      'Pull snug. The line should hold without slipping even under load.',
    ],
    tip: "Lead the line to the far horn first, not the near one — starting near is a rookie mistake that capsizes your figure-eight.",
    svg: CleatHitchSVG,
    tag: 'Essential',
  },
  {
    id: 'clove-hitch',
    name: 'Clove Hitch',
    use: 'Quick attachment to a rail, bollard, or pile. Good as a temporary tie-off but not for sustained load.',
    difficulty: 'Beginner',
    steps: [
      'Pass the line over the post from left to right.',
      'Bring the line around the back of the post.',
      'Cross over the first wrap (making an X).',
      'Pass the tail underneath the X and pull tight.',
    ],
    tip: "Fast and handy but can slip if load direction changes. Finish with a half-hitch on the standing part if you'll leave it unattended.",
    svg: CloveHitchSVG,
    tag: 'Common',
  },
  {
    id: 'figure-eight',
    name: 'Figure-Eight Stopper',
    use: 'Prevents a sheet or halyard from running through a block or fairlead.',
    difficulty: 'Beginner',
    steps: [
      'Form a loop by crossing the tail over the standing part.',
      'Take the tail around behind the standing part.',
      'Pass the tail back through the original loop from the front.',
      'Pull both ends to tighten into a figure-eight shape.',
    ],
    tip: "Every sheet end gets a figure-eight. If you hear a sail flogging after a tack, it's because someone skipped this step.",
    svg: FigureEightSVG,
    tag: 'Essential',
  },
  {
    id: 'round-turn',
    name: 'Round Turn & Two Half Hitches',
    use: 'Attaching a line to a ring, rail, or anchor. Holds under load and is easy to release.',
    difficulty: 'Beginner',
    steps: [
      'Pass the line through or around the object twice (full round turn).',
      'Cross the tail over the standing part and pass it underneath — first half hitch.',
      'Repeat: cross over and pass underneath — second half hitch.',
      'Slide both hitches up snug against the object.',
    ],
    tip: "The round turn takes the load; the half hitches just lock it. This means you can always ease the hitches under load without losing control.",
    svg: RoundTurnSVG,
    tag: 'Essential',
  },
  {
    id: 'sheet-bend',
    name: 'Sheet Bend',
    use: 'Joining two lines of different diameters — extending a dock line, connecting a tow line.',
    difficulty: 'Beginner',
    steps: [
      'Form a bight (U-shape) in the thicker line.',
      'Pass the thinner line up through the bight from underneath.',
      'Take the thinner line around behind both legs of the bight.',
      'Pass the thinner line under its own standing part (not under the bight).',
      'Pull to tighten. Both tail ends should exit on the same side.',
    ],
    tip: "Both tails must be on the same side or it's a left-handed sheet bend — half the strength and it'll slip under load.",
    svg: SheetBendSVG,
    tag: 'Common',
  },
  {
    id: 'reef-knot',
    name: 'Reef Knot',
    use: 'Tying reef points around a bundled sail. Only for light, equal loads — never as a bend for joining two working lines.',
    difficulty: 'Beginner',
    steps: [
      'Cross the left end over the right and pass under (half knot).',
      'Now cross the right end over the left and pass under.',
      'Pull both ends to tighten into a flat, symmetrical knot.',
      'Mnemonic: left over right, then right over left.',
    ],
    tip: "Right over right gives you a granny knot — it looks almost identical but jams under load and is useless in a reef. Practice until the flat shape is automatic.",
    svg: ReefKnotSVG,
    tag: 'Common',
  },
  {
    id: 'rolling-hitch',
    name: 'Rolling Hitch',
    use: 'Attaching a line to another under load — used to take the strain off a jammed winch or cleated line while you sort it out.',
    difficulty: 'Intermediate',
    steps: [
      'Pass the tail around the loaded line, crossing toward the direction of load.',
      'Make a second wrap in the same direction, crossing over the first (two wraps on the load side).',
      'Bring the tail across and make one wrap on the other side.',
      'Pass the tail under the last wrap and pull snug against the load direction.',
    ],
    tip: "The extra wrap always goes toward the load — that's what makes it grip. A clove hitch on a loaded line will just slide.",
    svg: RollingHitchSVG,
    tag: 'Advanced',
  },
  {
    id: 'anchor-hitch',
    name: 'Anchor Hitch (Fisherman\'s Bend)',
    use: 'Attaching a rode to an anchor shackle or ring. Will not slip or jam, and holds better than a round turn as load increases.',
    difficulty: 'Beginner',
    steps: [
      'Pass the line through the anchor ring twice.',
      'Bring the tail through both loops (not just the last one — this is what separates it from a round turn).',
      'Finish with two half hitches around the standing part.',
      'For permanent use, seize the tail to the standing part with whipping twine.',
    ],
    tip: "Tie this one before you need it — an anchor reset in a squall is not the time to be figuring out which loop the tail goes through.",
    svg: AnchorHitchSVG,
    tag: 'Essential',
  },
]

const TAG_COLORS = {
  Essential: { bg: '#EAF3DE', text: '#27500A', border: '#3B6D11' },
  Common:    { bg: '#E6F1FB', text: '#0C447C', border: '#185FA5' },
  Advanced:  { bg: '#FAEEDA', text: '#633806', border: '#C17B2A' },
}

const DIFF_COLOR = { Beginner: '#27500A', Intermediate: '#C17B2A', Advanced: '#791F1F' }

// ─── SVG rope drawing components ────────────────────────────────────────────

function BowlineSVG() {
  return (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 200 }}>
      <rect width="200" height="140" rx="8" fill="#f0f4f8" />
      {/* standing part */}
      <path d="M 30 110 L 30 65" stroke="#8B6914" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* small loop */}
      <ellipse cx="30" cy="55" rx="16" ry="11" stroke="#8B6914" strokeWidth="5" fill="none" />
      {/* tail going up through loop */}
      <path d="M 30 44 L 30 20" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* tail around standing part */}
      <path d="M 30 20 Q 55 15 60 35 Q 62 50 45 55" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* tail back down through loop */}
      <path d="M 45 55 Q 40 64 30 65" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* labels */}
      <text x="48" y="115" fontSize="10" fill="#555" fontFamily="sans-serif">standing</text>
      <text x="68" y="22" fontSize="10" fill="#C0392B" fontFamily="sans-serif">tail</text>
      <text x="34" y="36" fontSize="10" fill="#8B6914" fontFamily="sans-serif">loop</text>
    </svg>
  )
}

function CleatHitchSVG() {
  return (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 200 }}>
      <rect width="200" height="140" rx="8" fill="#f0f4f8" />
      {/* cleat body */}
      <rect x="60" y="55" width="80" height="18" rx="4" fill="#6B7280" />
      {/* cleat horns */}
      <ellipse cx="68" cy="64" rx="10" ry="7" fill="#4B5563" />
      <ellipse cx="132" cy="64" rx="10" ry="7" fill="#4B5563" />
      {/* base round turn */}
      <path d="M 30 100 L 100 100 L 100 72" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* figure eight */}
      <path d="M 100 72 Q 68 50 68 57" stroke="#8B6914" strokeWidth="4" fill="none" />
      <path d="M 68 57 Q 68 72 132 72" stroke="#C0392B" strokeWidth="4" fill="none" />
      <path d="M 132 72 Q 132 50 100 52 Q 80 52 80 64" stroke="#C0392B" strokeWidth="4" fill="none" />
      {/* locking hitch */}
      <path d="M 80 64 Q 68 58 70 72 Q 71 80 100 82" stroke="#27500A" strokeWidth="4" strokeDasharray="4 3" fill="none" />
      <text x="14" y="112" fontSize="10" fill="#555" fontFamily="sans-serif">dock line</text>
      <text x="140" y="52" fontSize="10" fill="#27500A" fontFamily="sans-serif">lock</text>
    </svg>
  )
}

function CloveHitchSVG() {
  return (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 200 }}>
      <rect width="200" height="140" rx="8" fill="#f0f4f8" />
      {/* post */}
      <rect x="88" y="10" width="24" height="120" rx="4" fill="#6B7280" />
      {/* first wrap */}
      <path d="M 30 55 L 88 55" stroke="#8B6914" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 112 55 Q 145 55 145 75 Q 145 90 112 90" stroke="#8B6914" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* cross / second wrap */}
      <path d="M 88 90 L 60 90" stroke="#C0392B" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 60 90 Q 30 90 30 75 Q 30 60 60 60 L 88 60" stroke="#C0392B" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* tail */}
      <path d="M 112 72 L 165 72" stroke="#C0392B" strokeWidth="5" strokeLinecap="round" fill="none" />
      <text x="152" y="68" fontSize="10" fill="#C0392B" fontFamily="sans-serif">tail</text>
      <text x="10" y="52" fontSize="10" fill="#8B6914" fontFamily="sans-serif">line</text>
    </svg>
  )
}

function FigureEightSVG() {
  return (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 200 }}>
      <rect width="200" height="140" rx="8" fill="#f0f4f8" />
      {/* standing part entering */}
      <path d="M 100 10 L 100 40" stroke="#8B6914" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* top loop of figure 8 */}
      <path d="M 100 40 Q 140 40 140 65 Q 140 85 100 85" stroke="#8B6914" strokeWidth="5" fill="none" />
      {/* cross-over */}
      <path d="M 100 85 Q 60 85 60 65 Q 60 50 100 50" stroke="#C0392B" strokeWidth="5" fill="none" />
      {/* bottom part */}
      <path d="M 100 50 Q 135 55 130 80 Q 125 105 100 105" stroke="#C0392B" strokeWidth="5" fill="none" />
      {/* tail */}
      <path d="M 100 105 L 100 130" stroke="#C0392B" strokeWidth="5" strokeLinecap="round" fill="none" />
      <text x="108" y="125" fontSize="10" fill="#C0392B" fontFamily="sans-serif">tail</text>
      <text x="108" y="20" fontSize="10" fill="#8B6914" fontFamily="sans-serif">to block</text>
    </svg>
  )
}

function RoundTurnSVG() {
  return (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 200 }}>
      <rect width="200" height="140" rx="8" fill="#f0f4f8" />
      {/* ring */}
      <circle cx="100" cy="70" r="30" stroke="#6B7280" strokeWidth="6" fill="none" />
      {/* round turn — two loops around ring */}
      <path d="M 30 60 Q 70 45 100 40 Q 130 45 150 60" stroke="#8B6914" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M 150 60 Q 160 70 155 80 Q 145 100 100 100 Q 55 100 45 80 Q 40 70 50 60" stroke="#8B6914" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* half hitches */}
      <path d="M 50 60 Q 30 55 30 70 Q 30 80 50 80" stroke="#C0392B" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 50 80 Q 30 75 30 90 Q 30 105 55 108 L 170 108" stroke="#C0392B" strokeWidth="4" fill="none" strokeLinecap="round" />
      <text x="108" y="23" fontSize="10" fill="#555" fontFamily="sans-serif">ring/rail</text>
      <text x="152" y="105" fontSize="10" fill="#C0392B" fontFamily="sans-serif">tail →</text>
    </svg>
  )
}

function SheetBendSVG() {
  return (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 200 }}>
      <rect width="200" height="140" rx="8" fill="#f0f4f8" />
      {/* thick line bight */}
      <path d="M 30 60 L 90 60 Q 120 60 120 80 Q 120 100 90 100 L 30 100" stroke="#8B6914" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* thin line */}
      <path d="M 170 45 Q 100 45 100 65" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M 100 65 Q 100 110 140 110 Q 170 110 170 90" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* tail lock */}
      <path d="M 170 90 Q 180 70 160 65 Q 145 60 145 72" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" fill="none" />
      <text x="32" y="78" fontSize="11" fill="#8B6914" fontFamily="sans-serif">thick</text>
      <text x="148" y="42" fontSize="11" fill="#C0392B" fontFamily="sans-serif">thin</text>
    </svg>
  )
}

function ReefKnotSVG() {
  return (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 200 }}>
      <rect width="200" height="140" rx="8" fill="#f0f4f8" />
      {/* left side */}
      <path d="M 20 70 Q 50 70 70 60 Q 90 50 100 70" stroke="#8B6914" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 20 70 Q 50 75 70 82 Q 90 90 100 70" stroke="#8B6914" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* right side */}
      <path d="M 180 70 Q 150 70 130 60 Q 110 50 100 70" stroke="#C0392B" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 180 70 Q 150 75 130 82 Q 110 90 100 70" stroke="#C0392B" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* center knot visual */}
      <ellipse cx="100" cy="70" rx="14" ry="10" fill="#f0f4f8" stroke="#aaa" strokeWidth="1" />
      <text x="92" y="74" fontSize="9" fill="#555" fontFamily="sans-serif">flat</text>
      <text x="22" y="50" fontSize="10" fill="#8B6914" fontFamily="sans-serif">left</text>
      <text x="155" y="50" fontSize="10" fill="#C0392B" fontFamily="sans-serif">right</text>
    </svg>
  )
}

function RollingHitchSVG() {
  return (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 200 }}>
      <rect width="200" height="140" rx="8" fill="#f0f4f8" />
      {/* loaded line (horizontal) */}
      <line x1="10" y1="70" x2="190" y2="70" stroke="#6B7280" strokeWidth="8" strokeLinecap="round" />
      <text x="155" y="62" fontSize="9" fill="#555" fontFamily="sans-serif">load →</text>
      {/* two wraps on load side */}
      <path d="M 80 30 Q 60 30 60 50 Q 60 70 80 70" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M 80 70 Q 55 70 55 90 Q 55 110 80 110 L 80 30" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* one wrap other side */}
      <path d="M 80 30 Q 115 30 115 50 Q 115 70 90 70" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* tail */}
      <path d="M 90 70 Q 90 90 110 100 L 160 120" stroke="#8B6914" strokeWidth="4" strokeLinecap="round" fill="none" />
      <text x="140" y="118" fontSize="10" fill="#8B6914" fontFamily="sans-serif">tail</text>
      <text x="30" y="108" fontSize="10" fill="#C0392B" fontFamily="sans-serif">2× load side</text>
    </svg>
  )
}

function AnchorHitchSVG() {
  return (
    <svg viewBox="0 0 200 140" style={{ width: '100%', maxWidth: 200 }}>
      <rect width="200" height="140" rx="8" fill="#f0f4f8" />
      {/* anchor ring */}
      <circle cx="100" cy="55" r="22" stroke="#6B7280" strokeWidth="6" fill="none" />
      {/* two turns through ring */}
      <path d="M 30 80 Q 78 33 100 33 Q 122 33 140 50" stroke="#8B6914" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 140 50 Q 155 65 145 80 Q 132 95 100 77" stroke="#8B6914" strokeWidth="5" fill="none" />
      <path d="M 100 77 Q 68 90 55 75 Q 45 62 55 52 Q 65 42 80 42" stroke="#C0392B" strokeWidth="4" fill="none" />
      {/* tail through both loops */}
      <path d="M 80 42 Q 78 65 100 68" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* half hitches */}
      <path d="M 100 68 Q 120 68 130 80 Q 138 95 120 105 L 30 115" stroke="#C0392B" strokeWidth="4" strokeLinecap="round" fill="none" />
      <text x="108" y="25" fontSize="10" fill="#555" fontFamily="sans-serif">shackle</text>
      <text x="12" y="125" fontSize="10" fill="#C0392B" fontFamily="sans-serif">← to rode</text>
    </svg>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function Knots() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')

  const tags = ['All', 'Essential', 'Common', 'Advanced']
  const visible = filter === 'All' ? KNOTS : KNOTS.filter(k => k.tag === filter)

  if (selected) {
    const knot = KNOTS.find(k => k.id === selected)
    const SvgComp = knot.svg

    return (
      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => setSelected(null)} style={{
          background: 'none', border: 'none', color: '#185FA5', fontSize: '13px',
          cursor: 'pointer', padding: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '4px'
        }}>
          ← Back to knots
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#0c2a4a' }}>{knot.name}</h2>
          <span style={{
            fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px',
            background: TAG_COLORS[knot.tag].bg, color: TAG_COLORS[knot.tag].text,
            border: `1px solid ${TAG_COLORS[knot.tag].border}`
          }}>{knot.tag}</span>
        </div>

        <div style={{ fontSize: '11px', fontWeight: '500', color: DIFF_COLOR[knot.difficulty], marginBottom: '16px' }}>
          {knot.difficulty}
        </div>

        {/* Interactive viewer — shown when knot has step data; falls back to static SVG */}
        {knot.interactive ? (
          <div style={{ marginBottom: '20px' }}>
            <KnotViewer knot={knot.interactive} />
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: '16px',
              background: '#f0f4f8', borderRadius: '12px', padding: '12px'
            }}>
              <SvgComp />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                How to tie it
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {knot.steps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      minWidth: '24px', height: '24px', borderRadius: '50%',
                      background: '#0c2a4a', color: '#fff', fontSize: '12px', fontWeight: '600',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>{i + 1}</div>
                    <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', paddingTop: '2px' }}>{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            When to use
          </div>
          <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>{knot.use}</div>
        </div>

        <div style={{
          background: '#f5f0e8', borderLeft: '4px solid #8B6914',
          borderRadius: '0 12px 12px 0', padding: '14px 16px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#8B6914', marginBottom: '4px' }}>
            Captain Cole says
          </div>
          <div style={{ fontSize: '13px', color: '#5a4010', lineHeight: '1.6', fontStyle: 'italic' }}>
            "{knot.tip}"
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '13px', color: '#555', marginBottom: '14px', lineHeight: '1.5' }}>
        Nine essential sailing knots. Tap any to see step-by-step instructions and a diagram.
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {tags.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
            border: filter === t ? '1.5px solid #0c2a4a' : '1px solid #ccc',
            background: filter === t ? '#0c2a4a' : '#fff',
            color: filter === t ? '#fff' : '#555',
            cursor: 'pointer'
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {visible.map(knot => {
          const SvgComp = knot.svg
          return (
            <button key={knot.id} onClick={() => setSelected(knot.id)} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '12px 14px', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.12)',
              background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%'
            }}>
              <div style={{ width: '72px', flexShrink: 0 }}>
                <SvgComp />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#0c2a4a' }}>{knot.name}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '20px',
                    background: TAG_COLORS[knot.tag].bg, color: TAG_COLORS[knot.tag].text
                  }}>{knot.tag}</span>
                </div>
                <div style={{ fontSize: '12px', color: DIFF_COLOR[knot.difficulty], fontWeight: '500', marginBottom: '4px' }}>
                  {knot.difficulty}
                </div>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{knot.use}</div>
              </div>
              <div style={{ color: '#bbb', fontSize: '18px', flexShrink: 0 }}>›</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
