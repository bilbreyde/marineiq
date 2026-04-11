import { useState, useEffect, useCallback } from 'react'
import KnotSVG from './KnotSVG'

const PLAY_INTERVAL_MS = 2400

export default function KnotViewer({ knot }) {
  const [step, setStep]     = useState(0)
  const [playing, setPlaying] = useState(false)

  const total   = knot.steps.length
  const isFirst = step === 0
  const isLast  = step === total - 1
  const current = knot.steps[step]

  const goNext = useCallback(() => {
    setStep(s => {
      if (s < total - 1) return s + 1
      setPlaying(false)   // stop at end
      return s
    })
  }, [total])

  const goPrev   = () => { setPlaying(false); setStep(s => Math.max(0, s - 1)) }
  const goTo     = i  => { setPlaying(false); setStep(i) }
  const replay   = () => { setPlaying(false); setStep(0) }
  const togglePlay = () => {
    if (isLast) { setStep(0); setPlaying(true); return }
    setPlaying(p => !p)
  }

  // Auto-advance while playing
  useEffect(() => {
    if (!playing) return
    const id = setTimeout(goNext, PLAY_INTERVAL_MS)
    return () => clearTimeout(id)
  }, [playing, step, goNext])

  const btnBase = {
    borderRadius: '8px', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', border: 'none', fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  }

  return (
    <div>
      {/* SVG diagram */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
        <KnotSVG knot={knot} step={step} />
      </div>

      {/* Step label + counter */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', color: '#888780', fontWeight: '600', letterSpacing: '0.3px' }}>
          STEP {step + 1} / {total}
        </span>
        <span style={{ fontSize: '11px', color: '#c4c2be', margin: '0 7px' }}>·</span>
        <span style={{ fontSize: '12px', color: '#0c2a4a', fontWeight: '600' }}>
          {current.label}
        </span>
      </div>

      {/* Progress bar — clickable dots */}
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '14px' }}>
        {knot.steps.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to step ${i + 1}`}
            style={{
              width: i === step ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === step ? '#0c2a4a' : i < step ? '#185FA5' : '#d0ceca',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.22s',
            }}
          />
        ))}
      </div>

      {/* Instruction text */}
      <div style={{
        background: '#f5f5f3',
        borderLeft: '3px solid #0c2a4a',
        borderRadius: '0 10px 10px 0',
        padding: '12px 14px',
        fontSize: '14px',
        color: '#2a2a28',
        lineHeight: '1.65',
        marginBottom: '16px',
        minHeight: '80px',
      }}>
        {current.instruction}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
        <button
          onClick={replay}
          style={{ ...btnBase, background: '#f0f0ee', color: '#5f5e5a', padding: '8px 14px' }}
        >
          ↩ Replay
        </button>

        <button
          onClick={goPrev}
          disabled={isFirst}
          style={{
            ...btnBase,
            background: '#f0f0ee', color: '#5f5e5a', padding: '8px 14px',
            opacity: isFirst ? 0.35 : 1,
            cursor: isFirst ? 'default' : 'pointer',
          }}
        >
          ← Prev
        </button>

        <button
          onClick={togglePlay}
          style={{
            ...btnBase,
            background: '#0c2a4a', color: '#fff', padding: '9px 22px',
            minWidth: '88px',
          }}
        >
          {playing ? '⏸ Pause' : isLast ? '↩ Again' : '▶ Play'}
        </button>

        <button
          onClick={() => { setPlaying(false); goNext() }}
          disabled={isLast}
          style={{
            ...btnBase,
            background: '#f0f0ee', color: '#5f5e5a', padding: '8px 14px',
            opacity: isLast ? 0.35 : 1,
            cursor: isLast ? 'default' : 'pointer',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
