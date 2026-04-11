import { useState } from 'react'

// ─── SVG Diagrams ──────────────────────────────────────────────────────────

function LateralMarksSVG() {
  return (
    <svg viewBox="0 0 260 160" style={{ width: '100%', maxWidth: '260px' }}>
      {/* Direction arrow */}
      <text x="130" y="14" textAnchor="middle" fontSize="10" fill="#888">← Leaving harbor / upstream →</text>
      {/* PORT - Red (IALA-B: even numbers, can shape) */}
      <rect x="30" y="30" width="30" height="50" rx="4" fill="#C0392B" />
      <rect x="35" y="20" width="20" height="12" rx="2" fill="#C0392B" />
      <line x1="45" y1="80" x2="45" y2="110" stroke="#555" strokeWidth="2" />
      <ellipse cx="45" cy="114" rx="14" ry="5" fill="#888" />
      <text x="45" y="95" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">2</text>
      <text x="45" y="135" textAnchor="middle" fontSize="10" fill="#C0392B" fontWeight="600">PORT</text>
      <text x="45" y="148" textAnchor="middle" fontSize="9" fill="#888">Red · Even</text>
      {/* Label */}
      <text x="45" y="158" textAnchor="middle" fontSize="9" fill="#888">Can shape</text>
      {/* STARBOARD - Green (IALA-B: odd numbers, nun shape) */}
      <polygon points="185,30 215,30 200,80" fill="#27AE60" />
      <line x1="200" y1="80" x2="200" y2="110" stroke="#555" strokeWidth="2" />
      <ellipse cx="200" cy="114" rx="14" ry="5" fill="#888" />
      <text x="200" y="58" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">1</text>
      <text x="200" y="135" textAnchor="middle" fontSize="10" fill="#27AE60" fontWeight="600">STARBOARD</text>
      <text x="200" y="148" textAnchor="middle" fontSize="9" fill="#888">Green · Odd</text>
      <text x="200" y="158" textAnchor="middle" fontSize="9" fill="#888">Conical shape</text>
      {/* Channel arrow */}
      <path d="M75 75 L175 75" stroke="#185FA5" strokeWidth="2" strokeDasharray="6,3" markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#185FA5" />
        </marker>
      </defs>
      <text x="125" y="70" textAnchor="middle" fontSize="9" fill="#185FA5">safe channel</text>
    </svg>
  )
}

function CardinalMarksSVG() {
  // Helper: draw a cardinal buoy at (cx, cy) with colors and topmarks
  function CardinalBuoy({ cx, cy, topColor, botColor, topmark, label, light }) {
    const bw = 18, bh = 36
    return (
      <g>
        {/* Body top half */}
        <rect x={cx - bw/2} y={cy - bh/2} width={bw} height={bh/2} fill={topColor} />
        {/* Body bottom half */}
        <rect x={cx - bw/2} y={cy} width={bw} height={bh/2} fill={botColor} rx="0" />
        {/* Topmark triangles */}
        {topmark === 'NN' && <>
          <polygon points={`${cx},${cy-bh/2-14} ${cx-6},${cy-bh/2-2} ${cx+6},${cy-bh/2-2}`} fill="#1a1a1a" />
          <polygon points={`${cx},${cy-bh/2-24} ${cx-6},${cy-bh/2-12} ${cx+6},${cy-bh/2-12}`} fill="#1a1a1a" />
        </>}
        {topmark === 'SS' && <>
          <polygon points={`${cx},${cy-bh/2-2} ${cx-6},${cy-bh/2-14} ${cx+6},${cy-bh/2-14}`} fill="#1a1a1a" />
          <polygon points={`${cx},${cy-bh/2-12} ${cx-6},${cy-bh/2-24} ${cx+6},${cy-bh/2-24}`} fill="#1a1a1a" />
        </>}
        {topmark === 'EE' && <>
          <polygon points={`${cx},${cy-bh/2-2} ${cx-6},${cy-bh/2-14} ${cx+6},${cy-bh/2-14}`} fill="#1a1a1a" />
          <polygon points={`${cx},${cy-bh/2-14} ${cx-6},${cy-bh/2-26} ${cx+6},${cy-bh/2-26}`} fill="#1a1a1a" />
        </>}
        {topmark === 'WW' && <>
          <polygon points={`${cx},${cy-bh/2-14} ${cx-6},${cy-bh/2-2} ${cx+6},${cy-bh/2-2}`} fill="#1a1a1a" />
          <polygon points={`${cx},${cy-bh/2-26} ${cx-6},${cy-bh/2-14} ${cx+6},${cy-bh/2-14}`} fill="#1a1a1a" />
        </>}
        {/* Pole */}
        <line x1={cx} y1={cy+bh/2} x2={cx} y2={cy+bh/2+16} stroke="#555" strokeWidth="1.5" />
        <ellipse cx={cx} cy={cy+bh/2+19} rx="8" ry="3" fill="#aaa" />
        <text x={cx} y={cy+bh/2+30} textAnchor="middle" fontSize="9" fontWeight="600" fill="#333">{label}</text>
        <text x={cx} y={cy+bh/2+40} textAnchor="middle" fontSize="8" fill="#888">{light}</text>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 280 180" style={{ width: '100%', maxWidth: '280px' }}>
      <text x="140" y="12" textAnchor="middle" fontSize="10" fill="#888">Pass to the indicated side of the hazard</text>
      {/* Hazard dot in center */}
      <circle cx="140" cy="90" r="8" fill="#C0392B" opacity="0.3" />
      <circle cx="140" cy="90" r="3" fill="#C0392B" />
      <text x="140" y="108" textAnchor="middle" fontSize="8" fill="#C0392B">hazard</text>
      {/* N */}
      <CardinalBuoy cx={140} cy={30} topColor="#1a1a1a" botColor="#F1C40F" topmark="NN" label="NORTH" light="VQ / Q" />
      {/* S */}
      <CardinalBuoy cx={140} cy={155} topColor="#F1C40F" botColor="#1a1a1a" topmark="SS" label="SOUTH" light="VQ(6)+LFl / Q(6)+LFl" />
      {/* E */}
      <CardinalBuoy cx={230} cy={90} topColor="#1a1a1a" botColor="#F1C40F" topmark="EE" label="EAST" light="VQ(3) / Q(3)" />
      {/* W */}
      <CardinalBuoy cx={50} cy={90} topColor="#F1C40F" botColor="#1a1a1a" topmark="WW" label="WEST" light="VQ(9) / Q(9)" />
    </svg>
  )
}

function LightCharsSVG() {
  const chars = [
    { name: 'F', desc: 'Fixed', pattern: [1], total: 5, color: '#E74C3C' },
    { name: 'Fl', desc: 'Flashing', pattern: [0.5, 2.5], total: 5, color: '#F39C12' },
    { name: 'Oc', desc: 'Occulting', pattern: [3, 1], total: 5, color: '#27AE60' },
    { name: 'Iso', desc: 'Isophase', pattern: [1.5, 1.5], total: 5, color: '#8E44AD' },
    { name: 'Q', desc: 'Quick', pattern: [0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3], total: 5, color: '#2980B9' },
  ]
  const W = 180, H_ROW = 22, PAD_LEFT = 42
  return (
    <svg viewBox={`0 0 ${PAD_LEFT + W + 10} ${chars.length * H_ROW + 20}`} style={{ width: '100%', maxWidth: '320px' }}>
      {chars.map((c, i) => {
        const y = i * H_ROW + 10
        const scale = W / c.total
        let x = PAD_LEFT
        let onPhase = true
        const blocks = []
        // For Fixed: just one big block
        if (c.name === 'F') {
          blocks.push(<rect key="f" x={PAD_LEFT} y={y+2} width={W} height={H_ROW-8} fill={c.color} rx="2" />)
        } else {
          for (const dur of c.pattern) {
            const w = dur * scale
            if (onPhase) {
              blocks.push(<rect key={x} x={x} y={y+2} width={Math.max(w-1,1)} height={H_ROW-8} fill={c.color} rx="1" />)
            }
            x += w
            onPhase = !onPhase
          }
        }
        return (
          <g key={c.name}>
            <text x={PAD_LEFT - 4} y={y + H_ROW/2 - 1} textAnchor="end" fontSize="10" fontWeight="700" fill="#333">{c.name}</text>
            <text x={4} y={y + H_ROW/2 - 1} textAnchor="start" fontSize="8" fill="#888">{c.desc}</text>
            <rect x={PAD_LEFT} y={y+2} width={W} height={H_ROW-8} fill="#eee" rx="2" />
            {blocks}
          </g>
        )
      })}
      <text x={PAD_LEFT + W/2} y={chars.length * H_ROW + 16} textAnchor="middle" fontSize="8" fill="#aaa">time →</text>
    </svg>
  )
}

function SpecialMarksSVG() {
  return (
    <svg viewBox="0 0 280 150" style={{ width: '100%', maxWidth: '280px' }}>
      {/* Isolated Danger */}
      <g>
        <rect x="20" y="35" width="22" height="14" fill="#1a1a1a" />
        <rect x="20" y="49" width="22" height="14" fill="#C0392B" />
        <rect x="20" y="63" width="22" height="14" fill="#1a1a1a" />
        <circle cx="31" cy="22" r="5" fill="#1a1a1a" />
        <circle cx="43" cy="22" r="5" fill="#1a1a1a" />
        <line x1="31" y1="77" x2="31" y2="98" stroke="#666" strokeWidth="1.5" />
        <ellipse cx="31" cy="101" rx="10" ry="3.5" fill="#aaa" />
        <text x="31" y="113" textAnchor="middle" fontSize="8" fontWeight="600" fill="#333">Isolated</text>
        <text x="31" y="123" textAnchor="middle" fontSize="8" fill="#333">Danger</text>
        <text x="31" y="133" textAnchor="middle" fontSize="7" fill="#888">Fl(2) White</text>
        <text x="31" y="143" textAnchor="middle" fontSize="7" fill="#888">Stay clear!</text>
      </g>
      {/* Safe Water */}
      <g>
        {[0,1,2,3,4,5].map(i => (
          <rect key={i} x={85 + i*7} y="35" width="7" height="50"
            fill={i % 2 === 0 ? '#C0392B' : '#fff'} stroke="#ddd" strokeWidth="0.5" />
        ))}
        <circle cx="108" cy="22" r="6" fill="#C0392B" />
        <line x1="108" y1="85" x2="108" y2="106" stroke="#666" strokeWidth="1.5" />
        <ellipse cx="108" cy="109" rx="10" ry="3.5" fill="#aaa" />
        <text x="108" y="121" textAnchor="middle" fontSize="8" fontWeight="600" fill="#333">Safe Water</text>
        <text x="108" y="131" textAnchor="middle" fontSize="7" fill="#888">Iso / Oc / F White</text>
        <text x="108" y="141" textAnchor="middle" fontSize="7" fill="#888">Mid-channel safe</text>
      </g>
      {/* Special Mark */}
      <g>
        <polygon points="175,35 197,35 197,85 175,85" fill="#F1C40F" rx="3" />
        <polygon points="186,18 186,18" />
        <rect x="183" y="14" width="6" height="6" fill="#F1C40F" />
        <line x1="186" y1="85" x2="186" y2="106" stroke="#666" strokeWidth="1.5" />
        <ellipse cx="186" cy="109" rx="10" ry="3.5" fill="#aaa" />
        <text x="186" y="121" textAnchor="middle" fontSize="8" fontWeight="600" fill="#333">Special</text>
        <text x="186" y="131" textAnchor="middle" fontSize="7" fill="#888">Fl Yellow</text>
        <text x="186" y="141" textAnchor="middle" fontSize="7" fill="#888">Cables/pipelines</text>
      </g>
      {/* Preferred Channel */}
      <g>
        <rect x="230" y="35" width="22" height="16" fill="#C0392B" />
        <rect x="230" y="51" width="22" height="17" fill="#27AE60" />
        <rect x="230" y="68" width="22" height="17" fill="#C0392B" />
        <line x1="241" y1="85" x2="241" y2="106" stroke="#666" strokeWidth="1.5" />
        <ellipse cx="241" cy="109" rx="10" ry="3.5" fill="#aaa" />
        <text x="241" y="121" textAnchor="middle" fontSize="8" fontWeight="600" fill="#333">Preferred</text>
        <text x="241" y="131" textAnchor="middle" fontSize="8" fill="#333">Channel</text>
        <text x="241" y="141" textAnchor="middle" fontSize="7" fill="#888">Fl(2+1) R/G</text>
      </g>
    </svg>
  )
}

function DepthSymbolsSVG() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', maxWidth: '280px' }}>
      {/* Blue water background */}
      <rect x="0" y="0" width="280" height="100" fill="#EAF4FB" rx="4" />
      {/* Chart "land" */}
      <polygon points="0,60 60,40 120,55 180,35 240,50 280,45 280,100 0,100" fill="#F5E6C8" />
      {/* Soundings */}
      <text x="40" y="30" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#185FA5">12</text>
      <text x="90" y="20" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#185FA5">7</text>
      <text x="150" y="25" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#185FA5">3</text>
      <text x="210" y="18" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#185FA5">18</text>
      {/* Drying height (underlined) */}
      <text x="100" y="52" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#C0392B">
        <tspan textDecoration="underline">2</tspan>
      </text>
      <text x="100" y="63" textAnchor="middle" fontSize="8" fill="#C0392B">drying ht.</text>
      {/* Rock awash */}
      <text x="165" y="48" textAnchor="middle" fontSize="11" fill="#555">+</text>
      {/* Submerged rock */}
      <text x="50" y="55" textAnchor="middle" fontSize="9" fill="#555">*</text>
      {/* Wreck symbol */}
      <g transform="translate(230,52)">
        <rect x="-10" y="-5" width="20" height="8" fill="none" stroke="#555" strokeWidth="1.2" />
        <line x1="-10" y1="-5" x2="10" y2="3" stroke="#555" strokeWidth="1.2" />
        <line x1="-10" y1="3" x2="10" y2="-5" stroke="#555" strokeWidth="1.2" />
      </g>
      {/* Depth contour line */}
      <path d="M0,72 Q70,62 140,70 Q200,78 280,68" fill="none" stroke="#185FA5" strokeWidth="1" strokeDasharray="4,2" />
      <text x="260" y="66" fontSize="8" fill="#185FA5">5m</text>
      {/* Legend */}
      <rect x="0" y="104" width="280" height="56" fill="#fff" />
      <text x="8" y="116" fontSize="9" fontWeight="600" fill="#333">Legend:</text>
      <text x="8" y="128" fontSize="9" fill="#185FA5" fontWeight="bold">12</text>
      <text x="22" y="128" fontSize="9" fill="#555"> depth in meters below chart datum</text>
      <text x="8" y="140" fontSize="9" fill="#C0392B"><tspan fontWeight="bold" textDecoration="underline">2</tspan></text>
      <text x="22" y="140" fontSize="9" fill="#555"> drying height (above datum at LW)</text>
      <text x="8" y="152" fontSize="9" fill="#555">+  rock awash    *  submerged rock    ✕  wreck</text>
    </svg>
  )
}

function CompassSVG() {
  const cx = 100, cy = 90, r = 65
  const magVar = 14 // degrees west variation for illustration
  const magRad = (magVar * Math.PI) / 180
  return (
    <svg viewBox="0 0 260 170" style={{ width: '100%', maxWidth: '260px' }}>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="#f8f8f6" stroke="#ccc" strokeWidth="1.5" />
      {/* Degree ticks */}
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i * 10 * Math.PI) / 180
        const x1 = cx + (r - 4) * Math.sin(a), y1 = cy - (r - 4) * Math.cos(a)
        const x2 = cx + r * Math.sin(a), y2 = cy - r * Math.cos(a)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#bbb" strokeWidth={i % 9 === 0 ? 2 : 1} />
      })}
      {/* Cardinal labels */}
      {[['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(([label, deg]) => {
        const a = (deg * Math.PI) / 180
        const lx = cx + (r - 14) * Math.sin(a), ly = cy - (r - 14) * Math.cos(a)
        return <text key={label} x={lx} y={ly + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">{label}</text>
      })}
      {/* True North arrow (solid black) */}
      <polygon points={`${cx},${cy - r + 20} ${cx - 5},${cy} ${cx + 5},${cy}`} fill="#1a1a1a" />
      <polygon points={`${cx},${cy + r - 20} ${cx - 5},${cy} ${cx + 5},${cy}`} fill="#ccc" />
      {/* Magnetic North arrow (dashed red) */}
      <polygon
        points={`${cx + (r-20)*Math.sin(magRad)},${cy - (r-20)*Math.cos(magRad)} ${cx + 5*Math.cos(magRad)},${cy + 5*Math.sin(magRad)} ${cx - 5*Math.cos(magRad)},${cy - 5*Math.sin(magRad)}`}
        fill="none" stroke="#C0392B" strokeWidth="2" strokeDasharray="4,2"
      />
      <line x1={cx} y1={cy} x2={cx + (r-20)*Math.sin(magRad)} y2={cy - (r-20)*Math.cos(magRad)}
        stroke="#C0392B" strokeWidth="2" strokeDasharray="4,2" />
      {/* Variation arc */}
      <path d={`M ${cx} ${cy - r + 25} A ${r-25} ${r-25} 0 0 1 ${cx + (r-25)*Math.sin(magRad)} ${cy - (r-25)*Math.cos(magRad)}`}
        fill="none" stroke="#C0392B" strokeWidth="1.5" />
      <text x={cx + 18} y={cy - r + 38} fontSize="8" fill="#C0392B">var.</text>
      <circle cx={cx} cy={cy} r="4" fill="#333" />
      {/* Legend */}
      <line x1="145" y1="45" x2="165" y2="45" stroke="#1a1a1a" strokeWidth="2" />
      <text x="170" y="49" fontSize="9" fill="#333">True North</text>
      <line x1="145" y1="60" x2="165" y2="60" stroke="#C0392B" strokeWidth="2" strokeDasharray="4,2" />
      <text x="170" y="64" fontSize="9" fill="#C0392B">Mag. North</text>
      <text x="145" y="80" fontSize="8" fill="#888">Var. = angle between</text>
      <text x="145" y="91" fontSize="8" fill="#888">true and magnetic N</text>
      <text x="145" y="110" fontSize="9" fontWeight="600" fill="#333">T = M + Var (W)</text>
      <text x="145" y="122" fontSize="9" fontWeight="600" fill="#333">T = M − Var (E)</text>
      <text x="145" y="138" fontSize="8" fill="#888">Deviation = compass</text>
      <text x="145" y="149" fontSize="8" fill="#888">error from local metal</text>
    </svg>
  )
}

function ChannelEntrySVG() {
  return (
    <svg viewBox="0 0 260 170" style={{ width: '100%', maxWidth: '260px' }}>
      {/* Water */}
      <rect x="0" y="0" width="260" height="170" fill="#EAF4FB" />
      {/* Land masses */}
      <polygon points="0,0 80,0 80,60 40,80 0,170" fill="#F5E6C8" />
      <polygon points="260,0 180,0 180,60 220,80 260,170" fill="#F5E6C8" />
      {/* Channel */}
      <path d="M80,60 Q130,90 180,60" fill="none" stroke="#185FA5" strokeWidth="1" strokeDasharray="5,3" />
      <path d="M40,80 Q130,120 220,80" fill="none" stroke="#185FA5" strokeWidth="1" strokeDasharray="5,3" />
      {/* Port buoy (red) */}
      <rect x="90" y="50" width="12" height="20" rx="2" fill="#C0392B" />
      <line x1="96" y1="70" x2="96" y2="82" stroke="#555" strokeWidth="1.5" />
      <text x="96" y="94" textAnchor="middle" fontSize="8" fill="#C0392B">R "4"</text>
      {/* Starboard buoy (green) */}
      <polygon points="168,50 180,50 174,70" fill="#27AE60" />
      <line x1="174" y1="70" x2="174" y2="82" stroke="#555" strokeWidth="1.5" />
      <text x="174" y="94" textAnchor="middle" fontSize="8" fill="#27AE60">G "3"</text>
      {/* Vessel */}
      <polygon points="130,100 120,120 140,120" fill="#555" />
      <text x="130" y="138" textAnchor="middle" fontSize="9" fill="#333">vessel</text>
      {/* Arrow */}
      <path d="M130,148 L130,162" stroke="#185FA5" strokeWidth="2" markerEnd="url(#arr2)" />
      <defs>
        <marker id="arr2" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#185FA5" />
        </marker>
      </defs>
      <text x="130" y="14" textAnchor="middle" fontSize="9" fontWeight="600" fill="#185FA5">Entering harbor (inbound)</text>
      <text x="130" y="26" textAnchor="middle" fontSize="9" fill="#888">Red Right Returning (IALA-B)</text>
      {/* Labels */}
      <text x="60" y="30" textAnchor="middle" fontSize="9" fill="#888">LAND</text>
      <text x="200" y="30" textAnchor="middle" fontSize="9" fill="#888">LAND</text>
    </svg>
  )
}

function ChartScaleSVG() {
  return (
    <svg viewBox="0 0 260 140" style={{ width: '100%', maxWidth: '260px' }}>
      {/* Scale bar */}
      <text x="130" y="16" textAnchor="middle" fontSize="10" fontWeight="600" fill="#333">Nautical Mile Scale Bar</text>
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={20 + i*44} y="26" width="44" height="14"
          fill={i % 2 === 0 ? '#333' : '#fff'} stroke="#333" strokeWidth="1"  />
      ))}
      {[0,1,2,3,4,5].map(i => (
        <g key={i}>
          <line x1={20 + i*44} y1="24" x2={20 + i*44} y2="44" stroke="#333" strokeWidth="1" />
          <text x={20 + i*44} y="54" textAnchor="middle" fontSize="9" fill="#333">{i}</text>
        </g>
      ))}
      <text x="130" y="65" textAnchor="middle" fontSize="9" fill="#888">Nautical Miles</text>
      {/* 1 NM = 1 minute of latitude */}
      <rect x="10" y="76" width="240" height="56" fill="#f8f8f6" rx="4" stroke="#ddd" strokeWidth="1" />
      <text x="20" y="90" fontSize="9" fontWeight="600" fill="#333">Key measurements:</text>
      <text x="20" y="103" fontSize="9" fill="#555">• 1 nautical mile = 1 minute of latitude (≈ 1.15 statute miles)</text>
      <text x="20" y="115" fontSize="9" fill="#555">• 1 knot = 1 nautical mile per hour</text>
      <text x="20" y="127" fontSize="9" fill="#555">• Large-scale chart = small area, more detail (e.g. 1:10,000)</text>
    </svg>
  )
}

// ─── Topic Data ────────────────────────────────────────────────────────────

const TOPICS = [
  {
    id: 'lateral',
    title: 'Lateral Marks',
    category: 'Marks',
    summary: 'Red and green buoys marking the sides of a navigable channel.',
    svg: LateralMarksSVG,
    facts: [
      'IALA-B system (US, Canada, Japan, Caribbean): Red Right Returning — keep red marks on the right (starboard) when heading toward harbor or upstream.',
      'IALA-A system (Europe, Africa, most of Asia): red marks on the left (port) when entering. The two systems are mirror images.',
      'Red marks: even numbers, can/nun shape, red light (any rhythm). Abbreviated "R" on charts.',
      'Green marks: odd numbers, conical/pillar shape, green light. Abbreviated "G" on charts.',
      'Numbers increase as you proceed upstream or toward harbor.',
      'Preferred channel buoys (junction marks) indicate the primary channel with red/green banding — the top color shows which side is preferred.',
    ],
    tip: "Red Right Returning — the three R's. If you're heading out to sea, red is on your left. Easy to check: look at the buoy number. Even means red, odd means green.",
  },
  {
    id: 'cardinals',
    title: 'Cardinal Marks',
    category: 'Marks',
    summary: 'Black and yellow marks indicating the safest water is to the named side.',
    svg: CardinalMarksSVG,
    facts: [
      'Cardinal marks indicate safe water lies to the named cardinal direction from the mark. "North cardinal" means pass to the north of the hazard.',
      'All cardinal marks are black and yellow with distinctive cone topmarks showing which cardinal quadrant they represent.',
      'North: black over yellow body, both cones pointing UP (▲▲). Light: VQ or Q (very quick / quick).',
      'South: yellow over black body, both cones pointing DOWN (▽▽). Light: VQ(6)+LFl or Q(6)+LFl.',
      'East: black/yellow/black body, cones pointing AWAY from each other (▲▽). Light: VQ(3) or Q(3).',
      'West: yellow/black/yellow body, cones pointing TOWARD each other (▽▲). Light: VQ(9) or Q(9).',
      'Memory aid for light groups: East=3, South=6, West=9 (clock positions 3, 6, 9).',
    ],
    tip: "The topmarks tell you everything. Two points up = North (pass north). Two points down = South. Points together = West (W looks like a waist). Points apart = East.",
  },
  {
    id: 'lights',
    title: 'Light Characteristics',
    category: 'Lights',
    summary: 'How to read and identify light rhythms on buoys and lighthouses.',
    svg: LightCharsSVG,
    facts: [
      'F (Fixed): continuous, unblinking light.',
      'Fl (Flashing): single flash shorter than dark period. Most common. Fl(3) = 3 flashes then darkness.',
      'Oc (Occulting): light is on more than off — brief eclipses interrupt a steady light.',
      'Iso (Isophase): equal on and off periods.',
      'Q (Quick): 50–60 flashes per minute. VQ = Very Quick (100–120/min).',
      'LFl (Long Flash): single flash of 2 seconds or more.',
      'The period (e.g. "Fl(2) 5s") tells you the full cycle length — 5 seconds for 2 flashes plus dark.',
      'Light colors: white (default, widest visibility), red (danger sector or lateral), green (safe water or lateral).',
    ],
    tip: "Count the flashes, then time the total period. Fl(2) 5s means two flashes, repeat every 5 seconds. Your chart and light list will confirm the match. Never assume — verify.",
  },
  {
    id: 'special-marks',
    title: 'Special & Danger Marks',
    category: 'Marks',
    summary: 'Isolated danger, safe water, and special purpose marks.',
    svg: SpecialMarksSVG,
    facts: [
      'Isolated Danger mark: black/red/black horizontal bands, two black balls topmark. Marks a small hazard with navigable water all around. Light: Fl(2) white.',
      'Safe Water mark (fairway/mid-channel): red and white vertical stripes, single red ball topmark. Marks mid-channel or fairway — safe all around. Light: Iso, Oc, or single long flash in white.',
      'Special mark (yellow): marks features like cables, pipelines, exercise zones, fish farms. Not a navigation aid. Light: Fl Yellow.',
      'Preferred Channel mark: red/green horizontal bands. Primary channel is indicated by the top color — red top = primary channel to port; green top = primary channel to starboard (IALA-B).',
      'Emergency Wreck mark: blue/yellow vertical stripes. Marks a recently sunk hazard not yet on charts.',
    ],
    tip: "Two black balls on top = isolated danger: there's something nasty right there but you can pass either side if you have room. Safe water marks let you know you're in the clear — aim straight at them.",
  },
  {
    id: 'depths',
    title: 'Depths & Hazard Symbols',
    category: 'Chart Reading',
    summary: 'Soundings, drying heights, rocks, wrecks, and depth contours.',
    svg: DepthSymbolsSVG,
    facts: [
      'Soundings: numbers on the chart showing depth below Chart Datum (CD) — the lowest predicted tide. The actual depth at high tide will be deeper.',
      'Drying height: a number with an underline (or overline) indicates height above CD that dries at low water. This area is underwater at high tide and exposed at low tide.',
      'Rock awash (+): covers and uncovers with the tide. Treat as a hazard.',
      'Submerged rock (*): always below water but may be shallower than surrounding soundings. Danger to keeled boats.',
      'Wreck (✕ or stylized W): depth of wreck shown alongside. Always check whether it is dangerous to your draft.',
      'Depth contour lines: dashed blue lines connect equal-depth points. The 5m and 10m contours are most used for coastal navigation.',
      'Chart Datum is typically Lowest Astronomical Tide (LAT) — add tide height to get actual depth.',
    ],
    tip: "Never trust a single sounding. Look at the contours around it to understand the shape of the bottom. A 12 surrounded by 3s means you've found a pinnacle — give it a wide berth.",
  },
  {
    id: 'compass',
    title: 'Compass & Variation',
    category: 'Navigation',
    summary: 'True vs magnetic bearings, variation, and deviation.',
    svg: CompassSVG,
    facts: [
      'True North (T): geographic north pole. Used on charts. Meridians (vertical lines) point to true north.',
      'Magnetic North (M): where compasses point. Moves slowly — varies by location and year.',
      'Variation: the angular difference between true and magnetic north at your location. Found on the chart compass rose. Apply it when converting between chart bearings and compass headings.',
      'Rule: "True Virgins Make Dull Company" — T(rue) V(ariation) M(agnetic) D(eviation) C(ompass). Work through in order when converting.',
      'West variation: magnetic bearing is LARGER than true. Add variation to get magnetic from true.',
      'East variation: magnetic bearing is SMALLER than true. Subtract variation to get magnetic from true.',
      'Deviation: error introduced by metal/electronics on your own boat. Recorded on a deviation card specific to your vessel.',
    ],
    tip: "If you plot a course on the chart, that's a true bearing. Your compass reads magnetic. In the US, variation is usually westerly (5–20°), so your compass heading will be higher than your chart course.",
  },
  {
    id: 'channel',
    title: 'Entering a Channel',
    category: 'Navigation',
    summary: 'Putting it all together: channel entry in an IALA-B port.',
    svg: ChannelEntrySVG,
    facts: [
      '"Red Right Returning" (IALA-B): when returning to port or heading upstream, keep red buoys on your starboard side.',
      'Heading out to sea (outbound): reverse — keep red on PORT, green on STARBOARD.',
      'Buoys are numbered: red increases toward harbor (2, 4, 6…), green increases toward harbor (1, 3, 5…).',
      'Day shapes vs lights: buoys have different shapes (can = red, cone = green) for daytime ID. At night, use light color and rhythm.',
      'Leading lines (range markers): two markers that line up to guide you through a channel. When front and rear markers are aligned, you are on track.',
      'Always consult the most recent chart and Notice to Mariners — buoys are moved, added, or removed frequently.',
    ],
    tip: "Before entering any new harbor, trace the route on the chart with your finger first. Identify every mark, note the depths through the channel, and know where the shoals are before you leave the cockpit.",
  },
  {
    id: 'scale',
    title: 'Chart Scale & Distance',
    category: 'Chart Reading',
    summary: 'Reading distances and understanding chart scale.',
    svg: ChartScaleSVG,
    facts: [
      '1 nautical mile (nm) = 1 minute of latitude (1/60th of a degree). This lets you use the latitude scale on the side of the chart to measure distance.',
      'Always measure distance on the LATITUDE scale (vertical sides), not the longitude scale — longitude minutes shrink toward the poles.',
      'Large-scale chart (e.g. 1:10,000): covers a small area with lots of detail. Use for harbor approaches and tight waters.',
      'Small-scale chart (e.g. 1:500,000): covers a large area with less detail. Use for passage planning offshore.',
      '1 knot = 1 nautical mile per hour. A boat doing 6 knots covers 1 nm every 10 minutes.',
      'Distance off = how far you are from a landmark. Use a hand bearing compass and chart to estimate your distance off a coast.',
    ],
    tip: "Dividers are your best friend. Open them to 1 nm on the lat scale, then walk them along your route. Count the steps and you have your distance. Simple, fast, doesn't need GPS.",
  },
]

const CAT_COLORS = {
  'Marks':        { bg: '#E6F1FB', text: '#0C447C' },
  'Lights':       { bg: '#FEF3C7', text: '#92400E' },
  'Chart Reading':{ bg: '#EAF3DE', text: '#27500A' },
  'Navigation':   { bg: '#EDE9FE', text: '#5B21B6' },
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function Charts() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')

  const categories = ['All', ...Object.keys(CAT_COLORS)]
  const filtered = filter === 'All' ? TOPICS : TOPICS.filter(t => t.category === filter)

  if (selected) {
    const topic = TOPICS.find(t => t.id === selected)
    const colors = CAT_COLORS[topic.category] || { bg: '#f5f5f3', text: '#333' }
    const SVG = topic.svg
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '12px 16px', border: 'none', background: 'none',
          fontSize: '13px', color: '#5f5e5a', cursor: 'pointer'
        }}>← Charts</button>

        <div style={{ padding: '0 16px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: colors.bg, color: colors.text, fontWeight: '600' }}>
              {topic.category}
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#0c2a4a', marginBottom: '4px' }}>{topic.title}</div>
          <div style={{ fontSize: '13px', color: '#5f5e5a', marginBottom: '20px' }}>{topic.summary}</div>

          {/* SVG Diagram */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <SVG />
          </div>

          {/* Facts */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Key Rules</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topic.facts.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#2a2a2a', lineHeight: '1.5' }}>
                  <span style={{ color: '#185FA5', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>·</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cole tip */}
          <div style={{ background: '#0c2a4a', borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>🧭 Cole says</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', fontStyle: 'italic' }}>{topic.tip}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ padding: '12px 16px 8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
            border: 'none', cursor: 'pointer',
            background: filter === cat ? '#0c2a4a' : '#f5f5f3',
            color: filter === cat ? '#fff' : '#5f5e5a'
          }}>{cat}</button>
        ))}
      </div>

      {/* Topic list */}
      <div style={{ padding: '4px 16px 32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(topic => {
          const colors = CAT_COLORS[topic.category] || { bg: '#f5f5f3', text: '#333' }
          const SVG = topic.svg
          return (
            <button key={topic.id} onClick={() => setSelected(topic.id)} style={{
              background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: '12px',
              padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '14px'
            }}>
              <div style={{ width: '72px', height: '56px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f6', borderRadius: '8px', overflow: 'hidden', padding: '4px' }}>
                <SVG />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>{topic.title}</span>
                </div>
                <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '20px', background: colors.bg, color: colors.text, fontWeight: '600' }}>{topic.category}</span>
                <div style={{ fontSize: '11px', color: '#888780', marginTop: '4px', lineHeight: '1.4' }}>{topic.summary}</div>
              </div>
              <span style={{ color: '#ccc', fontSize: '16px', flexShrink: 0 }}>›</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
