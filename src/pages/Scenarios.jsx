import { useState } from 'react'

const SCENARIOS = [
  {
    id: 1,
    title: 'Crossing — Power vs Power',
    rule: 'Rule 15',
    difficulty: 'beginner',
    vessels: [
      { x: 90, y: 135, heading: 0, type: 'power', label: 'You', color: '#60a5fa' },
      { x: 205, y: 85, heading: 270, type: 'power', label: 'Vessel B', color: '#fb923c' },
    ],
    question: 'You (blue) are a power vessel heading north. Vessel B is crossing from your starboard side heading west. You are on a collision course. What must you do?',
    options: [
      'Give way — alter course to starboard or slow down',
      'Maintain course and speed — you are the stand-on vessel',
      'Both vessels alter course to starboard',
      'Sound five short blasts and stop',
    ],
    correct: 0,
    explanation: "Rule 15 — in a crossing situation, the vessel with the other on its starboard side is the give-way vessel. Vessel B is on your starboard bow, so you give way. Alter course to starboard or reduce speed — do it early and decisively so Vessel B knows your intentions. Never wait for the last moment.",
  },
  {
    id: 2,
    title: 'Crossing — Stand-On Vessel',
    rule: 'Rule 17',
    difficulty: 'beginner',
    vessels: [
      { x: 185, y: 135, heading: 0, type: 'power', label: 'You', color: '#60a5fa' },
      { x: 75, y: 85, heading: 90, type: 'power', label: 'Vessel B', color: '#fb923c' },
    ],
    question: 'You (blue) are heading north. Vessel B crosses from your port side heading east. Vessel B is not altering course. What do you do?',
    options: [
      'Alter course immediately — never trust another vessel to give way',
      'Maintain course and speed; if B fails to act and collision is imminent, then take action',
      'Slow down to let Vessel B pass',
      'Turn to port to open the gap',
    ],
    correct: 1,
    explanation: "Rule 17 — you are the stand-on vessel. Vessel B has you on its starboard side and must give way. You maintain course and speed so B can predict your position. BUT — if B fails to act and collision becomes imminent, you must then take independent action. Standing on doesn't mean doing nothing until you collide.",
  },
  {
    id: 3,
    title: 'Head-On Situation',
    rule: 'Rule 14',
    difficulty: 'beginner',
    vessels: [
      { x: 140, y: 160, heading: 0, type: 'power', label: 'You', color: '#60a5fa' },
      { x: 140, y: 48, heading: 180, type: 'power', label: 'Vessel B', color: '#fb923c' },
    ],
    question: 'Two power vessels are meeting head-on — you heading north, Vessel B heading south, directly toward you. What is the correct action?',
    options: [
      'The faster vessel gives way',
      'The smaller vessel gives way',
      'Both vessels alter course to starboard to pass port-to-port',
      'One vessel stops; the other passes on whichever side has more room',
    ],
    correct: 2,
    explanation: "Rule 14 — head-on, both power vessels alter course to starboard and pass port-to-port. If in doubt whether it's head-on or crossing, treat it as head-on. Pass port to port — every time, without negotiation.",
  },
  {
    id: 4,
    title: 'Overtaking Vessel',
    rule: 'Rule 13',
    difficulty: 'beginner',
    vessels: [
      { x: 130, y: 72, heading: 0, type: 'power', label: 'Vessel A', color: '#fb923c' },
      { x: 195, y: 158, heading: 355, type: 'power', label: 'You', color: '#60a5fa' },
    ],
    question: 'You (blue) are approaching Vessel A from its starboard quarter — from more than 22.5° abaft its beam. You are faster. Who gives way?',
    options: [
      'Vessel A — you are overtaking on its starboard side so it must yield',
      'You — the overtaking vessel always keeps clear until past and clear',
      'Vessel A only if it is also a power vessel',
      'Whichever vessel sounds one short blast first',
    ],
    correct: 1,
    explanation: "Rule 13 — the overtaking vessel keeps clear, full stop. It doesn't matter what type of propulsion you have or which side you overtake on. Coming from abaft the beam puts you in the overtaking role. Hold back, pass when safe, and stay clear until well ahead. The overtaken vessel maintains course and speed.",
  },
  {
    id: 5,
    title: 'Power vs Sailing Vessel',
    rule: 'Rule 18',
    difficulty: 'beginner',
    vessels: [
      { x: 75, y: 135, heading: 55, type: 'power', label: 'You', color: '#60a5fa' },
      { x: 200, y: 88, heading: 200, type: 'sail', label: 'Vessel B', color: '#fb923c' },
    ],
    question: 'You are a power vessel heading northeast. Vessel B is a sailing vessel under sail only, crossing your path. Who gives way?',
    options: [
      'Vessel B gives way — it is in your path',
      'You give way — power must keep clear of sail',
      'The vessel with the other on its starboard side gives way',
      'The slower vessel gives way',
    ],
    correct: 1,
    explanation: "Rule 18 — a power-driven vessel shall keep out of the way of a sailing vessel under sail. When a sailboat has no engine running, it holds privilege over power. The type hierarchy overrides simple crossing geometry here. You give way — period.",
  },
  {
    id: 6,
    title: 'Sail Overtaking Power',
    rule: 'Rule 13',
    difficulty: 'intermediate',
    vessels: [
      { x: 130, y: 72, heading: 0, type: 'power', label: 'Vessel A', color: '#fb923c' },
      { x: 78, y: 160, heading: 12, type: 'sail', label: 'You (sail)', color: '#60a5fa' },
    ],
    question: 'You are under sail only, overtaking Vessel A (power) from its port quarter. Sailing vessels normally have right of way over power. What applies here?',
    options: [
      'Sail has right of way — maintain course and pass',
      'You give way — the overtaking rule overrides the power/sail hierarchy',
      'Sound one short blast and pass on the starboard side',
      'Vessel A must give way since you are under sail',
    ],
    correct: 1,
    explanation: "Rule 13 overrides Rule 18. The overtaking rule is absolute — the overtaking vessel keeps clear regardless of vessel type. A sailing vessel overtaking a power vessel must give way to that power vessel until finally past and clear. 'Sail over power' only applies when not overtaking.",
  },
  {
    id: 7,
    title: 'Two Sailing Vessels — Opposite Tacks',
    rule: 'Rule 12',
    difficulty: 'intermediate',
    vessels: [
      { x: 80, y: 135, heading: 50, type: 'sail', label: 'You (port tack)', color: '#60a5fa' },
      { x: 205, y: 98, heading: 210, type: 'sail', label: 'Vessel B (stbd tack)', color: '#fb923c' },
    ],
    wind: 280,
    question: 'Wind is from the west. You are on port tack (wind on your port/left side). Vessel B is on starboard tack (wind on its starboard/right side). Who gives way?',
    options: [
      'Vessel B gives way — you got there first',
      'You give way — port tack gives way to starboard tack',
      'The vessel closest to the wind gives way',
      'The leeward vessel gives way',
    ],
    correct: 1,
    explanation: "Rule 12(a)(i) — when sailing vessels are on opposite tacks, the port-tack vessel keeps clear of the starboard-tack vessel. If the wind is on your port side, you are on port tack — you give way. If on your starboard side, you are on starboard tack — you stand on. Simple rule, absolute application.",
  },
  {
    id: 8,
    title: 'Two Sailing Vessels — Same Tack',
    rule: 'Rule 12',
    difficulty: 'intermediate',
    vessels: [
      { x: 90, y: 78, heading: 100, type: 'sail', label: 'You (windward)', color: '#60a5fa' },
      { x: 90, y: 155, heading: 100, type: 'sail', label: 'Vessel B (leeward)', color: '#fb923c' },
    ],
    wind: 0,
    question: 'Wind is from the north. Both vessels are on starboard tack heading east. You are the windward vessel (upwind, closer to where the wind is coming from). Who gives way?',
    options: [
      'Vessel B gives way — it is downwind and in less danger',
      'You give way — the windward vessel keeps clear of the leeward vessel',
      'The faster vessel gives way',
      'Neither — same-tack vessels hold their courses',
    ],
    correct: 1,
    explanation: "Rule 12(a)(ii) — when two sailing vessels are on the same tack, the windward vessel keeps clear of the leeward vessel. You are upwind, so you give way. The leeward vessel has limited room to bear away — it cannot easily turn downwind without collision risk. Windward gives way.",
  },
  {
    id: 9,
    title: 'Power vs Fishing Vessel',
    rule: 'Rule 18',
    difficulty: 'intermediate',
    vessels: [
      { x: 68, y: 120, heading: 80, type: 'power', label: 'You', color: '#60a5fa' },
      { x: 200, y: 100, heading: 210, type: 'fishing', label: 'Fishing Vessel', color: '#fb923c' },
    ],
    question: 'You are a power vessel. A commercial fishing vessel with gear deployed is in your path. It is restricted in ability to maneuver due to its gear. Who gives way?',
    options: [
      'The fishing vessel — the crossing rules still apply',
      'You give way — power must keep clear of a vessel engaged in fishing',
      'Both alter course to starboard',
      'The vessel with the other on its starboard side gives way',
    ],
    correct: 1,
    explanation: "Rule 18 — a power vessel must keep out of the way of a vessel engaged in fishing. A fishing vessel with deployed gear cannot just steer away — the gear constrains it. The vessel type hierarchy overrides crossing geometry. Give fishing vessels a wide berth and expect them to hold their course.",
  },
  {
    id: 10,
    title: 'Vessel Not Under Command',
    rule: 'Rule 18',
    difficulty: 'intermediate',
    vessels: [
      { x: 68, y: 120, heading: 90, type: 'power', label: 'You', color: '#60a5fa' },
      { x: 205, y: 100, heading: 20, type: 'nuc', label: 'NUC Vessel', color: '#fb923c' },
    ],
    question: 'A vessel displays two red lights in a vertical line — Not Under Command. It is drifting into your path. You are a power vessel. What must you do?',
    options: [
      'Sound five short blasts — the NUC vessel must respond',
      'Give way — NUC vessels cannot maneuver. Every vessel keeps clear',
      'Maintain course — the crossing rules give you right of way',
      'Radio the vessel before making any maneuver',
    ],
    correct: 1,
    explanation: "Rule 18 — a NUC vessel is at the top of the privilege hierarchy. It has lost the ability to maneuver — engine failure, loss of steering, whatever the cause. It cannot get out of your way. Every other vessel keeps clear. Alter course well in advance and give it a very wide berth.",
  },
]

function getCardinal(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

function CourseLines({ vessels }) {
  return vessels.map((v, i) => {
    const rad = (v.heading * Math.PI) / 180
    const x2 = v.x + Math.sin(rad) * 65
    const y2 = v.y - Math.cos(rad) * 65
    return (
      <line key={i} x1={v.x} y1={v.y} x2={x2} y2={y2}
        stroke={v.color} strokeWidth="1.5" strokeDasharray="5,4" opacity="0.35" />
    )
  })
}

function VesselShape({ x, y, heading, type, label, color }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <g transform={`rotate(${heading})`}>
        {/* hull */}
        <polygon points="0,-17 10,10 0,4 -10,10"
          fill={color} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        {/* port light (red, left side when facing forward) */}
        <circle cx="-8" cy="1" r="3.5" fill="#ef4444" opacity="0.9" />
        {/* starboard light (green, right side) */}
        <circle cx="8" cy="1" r="3.5" fill="#22c55e" opacity="0.9" />
        {/* NUC indicator — two red circles above hull */}
        {type === 'nuc' && <>
          <circle cx="0" cy="-25" r="4.5" fill="#ef4444" stroke="#fff" strokeWidth="1" />
          <circle cx="0" cy="-33" r="4.5" fill="#ef4444" stroke="#fff" strokeWidth="1" />
        </>}
        {/* fishing indicator */}
        {type === 'fishing' && <>
          <circle cx="0" cy="-26" r="3.5" fill="#ef4444" opacity="0.9" />
          <circle cx="0" cy="-26" r="3.5" fill="none" stroke="#fff" strokeWidth="1" />
          <circle cx="0" cy="-34" r="3.5" fill="#fff" opacity="0.9" />
        </>}
      </g>
      {/* label — not rotated */}
      <text x="0" y="30" textAnchor="middle" fill="#fff"
        fontSize="10" fontWeight="600" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
        {label}
      </text>
      {/* type badge */}
      <text x="0" y="40" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="8">
        {type === 'nuc' ? 'NUC' : type === 'fishing' ? 'fishing' : type === 'sail' ? 'sailing' : 'power'}
      </text>
    </g>
  )
}

function ScenarioDiagram({ vessels, wind }) {
  return (
    <svg viewBox="0 0 280 210" style={{ width: '100%', background: '#0f3460', borderRadius: '12px', display: 'block' }}>
      {/* subtle water grid */}
      <defs>
        <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="280" height="210" fill="url(#grid)" />

      {/* compass N indicator */}
      <text x="14" y="15" fill="rgba(255,255,255,0.35)" fontSize="9" fontWeight="600">N</text>
      <line x1="14" y1="17" x2="14" y2="26" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

      {/* wind indicator */}
      {wind !== undefined && (() => {
        const rad = (wind * Math.PI) / 180
        const wx = 255, wy = 18
        const ex = wx + Math.sin(rad) * 14
        const ey = wy - Math.cos(rad) * 14
        return (
          <g>
            <text x={wx} y="13" textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="8">
              Wind from {getCardinal(wind)}
            </text>
            <line x1={wx - Math.sin(rad) * 14} y1={wy + Math.cos(rad) * 14}
              x2={ex} y2={ey}
              stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"
              markerEnd="url(#arrow)" />
          </g>
        )
      })()}

      {/* course lines */}
      <CourseLines vessels={vessels} />

      {/* vessels */}
      {vessels.map((v, i) => <VesselShape key={i} {...v} />)}
    </svg>
  )
}

function ResultScreen({ score, total, onRestart }) {
  const pct = Math.round((score / total) * 100)
  return (
    <div style={{ padding: '24px 16px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>
        {pct === 100 ? '⚓' : pct >= 70 ? '🧭' : '📚'}
      </div>
      <div style={{ fontSize: '36px', fontWeight: '700', color: '#0c2a4a' }}>{pct}%</div>
      <div style={{ fontSize: '15px', color: '#5f5e5a', marginTop: '4px' }}>{score} of {total} correct</div>
      <div style={{ fontSize: '13px', color: '#888780', marginTop: '8px', fontStyle: 'italic', marginBottom: '28px' }}>
        {pct === 100
          ? "Textbook seamanship. Every skipper within five miles is safer because you know your rules."
          : pct >= 70
          ? "Solid foundation — but the sea doesn't curve grades. Review your misses."
          : "Back to the rules, sailor. These scenarios aren't hypothetical — they happen every day on the water."}
      </div>
      <button onClick={onRestart} style={{
        width: '100%', padding: '14px', borderRadius: '12px',
        background: '#0c2a4a', color: '#fff', border: 'none',
        fontSize: '14px', fontWeight: '500', cursor: 'pointer'
      }}>
        Try again
      </button>
    </div>
  )
}

export default function Scenarios() {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)

  const scenario = SCENARIOS[current]

  function select(i) {
    if (selected !== null) return
    setSelected(i)
    if (i === scenario.correct) setScore(s => s + 1)
  }

  function next() {
    if (current + 1 < SCENARIOS.length) {
      setCurrent(c => c + 1)
      setSelected(null)
    } else {
      setCurrent(-1)
    }
  }

  function restart() {
    setCurrent(0)
    setSelected(null)
    setScore(0)
  }

  if (current === -1) return <ResultScreen score={score} total={SCENARIOS.length} onRestart={restart} />

  const isCorrect = selected === scenario.correct

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      {/* progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', color: '#888780' }}>
          Scenario {current + 1} of {SCENARIOS.length}
        </div>
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#185FA5' }}>
          {score}/{current + (selected !== null ? 1 : 0)} correct
        </div>
      </div>
      <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', marginBottom: '14px' }}>
        <div style={{
          height: '100%', borderRadius: '2px', background: '#185FA5', transition: 'width 0.3s',
          width: `${(current / SCENARIOS.length) * 100}%`
        }} />
      </div>

      {/* header */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#0c2a4a' }}>{scenario.title}</span>
        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#E6F1FB', color: '#0C447C', fontWeight: '500' }}>
          {scenario.rule}
        </span>
        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#f5f5f3', color: '#888780' }}>
          {scenario.difficulty}
        </span>
      </div>

      {/* diagram */}
      <div style={{ marginBottom: '14px' }}>
        <ScenarioDiagram vessels={scenario.vessels} wind={scenario.wind} />
      </div>

      {/* question */}
      <div style={{ fontSize: '14px', lineHeight: '1.55', color: '#1a1a1a', marginBottom: '14px', fontWeight: '500' }}>
        {scenario.question}
      </div>

      {/* options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        {scenario.options.map((opt, i) => {
          let bg = '#fff', border = '0.5px solid rgba(0,0,0,0.15)', color = '#1a1a1a'
          if (selected !== null) {
            if (i === scenario.correct) { bg = '#EAF3DE'; border = '1.5px solid #3B6D11'; color = '#27500A' }
            else if (i === selected && !isCorrect) { bg = '#FCEBEB'; border = '1.5px solid #A32D2D'; color = '#791F1F' }
          }
          return (
            <button key={i} onClick={() => select(i)} disabled={selected !== null} style={{
              padding: '13px 16px', borderRadius: '12px', background: bg, border, color,
              fontSize: '14px', textAlign: 'left', cursor: selected !== null ? 'default' : 'pointer',
              fontFamily: 'inherit', lineHeight: '1.4', transition: 'all 0.15s'
            }}>
              <span style={{ fontWeight: '500', marginRight: '8px' }}>{['A', 'B', 'C', 'D'][i]}.</span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* explanation */}
      {selected !== null && (
        <div style={{
          padding: '14px 16px', marginBottom: '12px',
          background: isCorrect ? '#EAF3DE' : '#FCEBEB',
          borderLeft: `4px solid ${isCorrect ? '#3B6D11' : '#A32D2D'}`,
          borderRadius: '0 12px 12px 0', fontSize: '13px', lineHeight: '1.65',
          color: isCorrect ? '#27500A' : '#791F1F'
        }}>
          {scenario.explanation}
        </div>
      )}

      {/* next */}
      {selected !== null && (
        <button onClick={next} style={{
          width: '100%', padding: '14px', borderRadius: '12px',
          background: '#0c2a4a', color: '#fff', border: 'none',
          fontSize: '14px', fontWeight: '500', cursor: 'pointer'
        }}>
          {current + 1 < SCENARIOS.length ? 'Next scenario' : 'See results'}
        </button>
      )}
    </div>
  )
}
