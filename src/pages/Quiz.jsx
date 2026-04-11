import { useState, useEffect } from 'react'
import { apiPost } from '../api'
import Scenarios from './Scenarios'
import Knots from './Knots'

const CATEGORY_COLORS = {
  COLREGS:     { bg: '#E6F1FB', text: '#0C447C' },
  Navigation:  { bg: '#EAF3DE', text: '#27500A' },
  Seamanship:  { bg: '#FAEEDA', text: '#633806' },
  Safety:      { bg: '#FCEBEB', text: '#791F1F' },
  Weather:     { bg: '#EDE9FE', text: '#5B21B6' },
  Regulations: { bg: '#FEF3C7', text: '#92400E' },
  'Deck General': { bg: '#E0F2FE', text: '#075985' },
  'First Aid': { bg: '#FCE7F3', text: '#9D174D' },
}

export default function Quiz({ userId }) {
  const [tab, setTab] = useState('quiz')
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [answers, setAnswers] = useState([]) // tracks {category, correct} per question
  const [loading, setLoading] = useState(true)
  const [grading, setGrading] = useState(false)
  const [history, setHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => { loadQuestions() }, [])

  async function loadQuestions() {
    setLoading(true)
    try {
      const data = await apiPost('quiz', { action: 'get', count: 10 })
      setQuestions(data.questions || [])
      setCurrent(0)
      setSelected(null)
      setResult(null)
      setScore({ correct: 0, total: 0 })
      setAnswers([])
    } catch (e) {}
    finally { setLoading(false) }
  }

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const data = await apiPost('quiz', { action: 'getProgress', userId })
      setHistory(data)
    } catch (e) {}
    finally { setHistoryLoading(false) }
  }

  function switchTab(t) {
    setTab(t)
    if (t === 'history' && !history) loadHistory()
  }

  async function grade(answerIndex) {
    if (selected !== null || grading) return
    setSelected(answerIndex)
    setGrading(true)
    try {
      const data = await apiPost('quiz', {
        action: 'grade',
        questionId: questions[current].id,
        selectedAnswer: answerIndex
      })
      setResult(data)
      const isCorrect = data.correct
      setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }))
      setAnswers(a => [...a, { category: data.category, correct: isCorrect }])
    } catch (e) {
      setResult({ correct: false, explanation: 'Could not reach the Captain. Try again.' })
    } finally {
      setGrading(false)
    }
  }

  async function next() {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
      setSelected(null)
      setResult(null)
    } else {
      // Quiz complete — save progress
      const finalScore = score.correct + (result?.correct ? 0 : 0) // already updated via setScore
      const cats = {}
      answers.forEach(a => {
        if (!cats[a.category]) cats[a.category] = { correct: 0, total: 0 }
        cats[a.category].total++
        if (a.correct) cats[a.category].correct++
      })
      try {
        await apiPost('quiz', {
          action: 'saveProgress',
          userId,
          score: score.correct,
          total: score.total,
          categories: cats
        })
        setHistory(null) // invalidate so history reloads fresh next time
      } catch (e) {}
      setCurrent(-1)
    }
  }

  if (loading) return (
    <div style={{ padding: '40px 16px', textAlign: 'center', color: '#888780' }}>
      Captain Cole is preparing your questions...
    </div>
  )

  return (
    <div>
      <div style={{ background: '#0c2a4a', padding: '16px 16px 0' }}>
        <div style={{ color: '#fff', fontSize: '17px', fontWeight: '600', marginBottom: '12px' }}>Training</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[{ id: 'quiz', label: 'Quiz' }, { id: 'scenarios', label: 'Scenarios' }, { id: 'knots', label: 'Knots' }, { id: 'history', label: 'Progress' }].map(t => (
            <button key={t.id} onClick={() => switchTab(t.id)} style={{
              padding: '7px 16px', borderRadius: '8px 8px 0 0', fontSize: '13px', fontWeight: '500',
              border: 'none', cursor: 'pointer',
              background: tab === t.id ? '#fff' : 'rgba(255,255,255,0.12)',
              color: tab === t.id ? '#0c2a4a' : 'rgba(255,255,255,0.7)'
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'history' ? (
        <HistoryTab history={history} loading={historyLoading} onRetry={loadHistory} />
      ) : tab === 'scenarios' ? (
        <Scenarios />
      ) : tab === 'knots' ? (
        <Knots />
      ) : current === -1 ? (
        <ResultsScreen score={score} answers={answers} onRetry={() => { loadQuestions(); setCurrent(0) }} />
      ) : (
        <QuizScreen
          questions={questions} current={current} selected={selected}
          result={result} score={score} grading={grading}
          onGrade={grade} onNext={next}
        />
      )}
    </div>
  )
}

function QuizScreen({ questions, current, selected, result, score, grading, onGrade, onNext }) {
  const q = questions[current]
  if (!q) return null

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#888780' }}>Question {current + 1} of {questions.length}</div>
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#185FA5' }}>{score.correct}/{score.total} correct</div>
      </div>

      <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', marginBottom: '20px' }}>
        <div style={{ height: '100%', width: `${(current / questions.length) * 100}%`, background: '#185FA5', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ fontSize: '11px', fontWeight: '500', color: '#888780', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {q.category} &middot; {q.difficulty}
      </div>

      <div style={{ fontSize: '16px', fontWeight: '500', lineHeight: '1.5', marginBottom: '20px', color: '#1a1a1a' }}>
        {q.question}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {q.options.map((opt, i) => {
          let bg = '#fff', border = '0.5px solid rgba(0,0,0,0.15)', color = '#1a1a1a'
          if (selected !== null && result) {
            if (i === result.correctAnswer) { bg = '#EAF3DE'; border = '1.5px solid #3B6D11'; color = '#27500A' }
            else if (i === selected && !result.correct) { bg = '#FCEBEB'; border = '1.5px solid #A32D2D'; color = '#791F1F' }
          }
          return (
            <button key={i} onClick={() => onGrade(i)} disabled={selected !== null} style={{
              padding: '14px 16px', borderRadius: '12px', background: bg,
              border, color, fontSize: '14px', textAlign: 'left',
              cursor: selected !== null ? 'default' : 'pointer',
              transition: 'all 0.2s', fontFamily: 'inherit', lineHeight: '1.4'
            }}>
              <span style={{ fontWeight: '500', marginRight: '8px' }}>{['A', 'B', 'C', 'D'][i]}.</span>
              {opt}
            </button>
          )
        })}
      </div>

      {result && (
        <div style={{
          padding: '14px 16px', marginBottom: '12px',
          background: result.correct ? '#EAF3DE' : '#FCEBEB',
          borderLeft: `4px solid ${result.correct ? '#3B6D11' : '#A32D2D'}`,
          borderRadius: '0 12px 12px 0', fontSize: '13px', lineHeight: '1.6',
          color: result.correct ? '#27500A' : '#791F1F'
        }}>
          {result.explanation}
        </div>
      )}

      {result && (
        <button onClick={onNext} style={{
          width: '100%', padding: '14px', borderRadius: '12px',
          background: '#0c2a4a', color: '#fff', border: 'none',
          fontSize: '14px', fontWeight: '500'
        }}>
          {current + 1 < questions.length ? 'Next question' : 'See results'}
        </button>
      )}
    </div>
  )
}

function ResultsScreen({ score, answers, onRetry }) {
  const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  const cats = {}
  answers.forEach(a => {
    if (!cats[a.category]) cats[a.category] = { correct: 0, total: 0 }
    cats[a.category].total++
    if (a.correct) cats[a.category].correct++
  })

  return (
    <div style={{ padding: '24px 16px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>
          {pct === 100 ? '⚓' : pct >= 70 ? '🧭' : '📚'}
        </div>
        <div style={{ fontSize: '36px', fontWeight: '700', color: '#0c2a4a' }}>{pct}%</div>
        <div style={{ fontSize: '15px', color: '#5f5e5a', marginTop: '4px' }}>
          {score.correct} of {score.total} correct
        </div>
        <div style={{ fontSize: '13px', color: '#888780', marginTop: '8px', fontStyle: 'italic' }}>
          {pct === 100
            ? "Outstanding, sailor. You know your rules cold."
            : pct >= 70
            ? "Not bad — but the sea doesn't grade on a curve. Study those misses."
            : "Back to the books, sailor. Lives depend on knowing this cold."}
        </div>
      </div>

      {Object.keys(cats).length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            By category
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(cats).map(([cat, s]) => {
              const catPct = Math.round((s.correct / s.total) * 100)
              const colors = CATEGORY_COLORS[cat] || { bg: '#f5f5f3', text: '#5f5e5a' }
              return (
                <div key={cat} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '10px', padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '20px', background: colors.bg, color: colors.text, fontWeight: '500' }}>{cat}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: catPct >= 70 ? '#27500A' : '#791F1F' }}>{catPct}% · {s.correct}/{s.total}</span>
                  </div>
                  <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${catPct}%`, background: catPct >= 70 ? '#3B6D11' : '#A32D2D', borderRadius: '2px', transition: 'width 0.4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button onClick={onRetry} style={{
        width: '100%', padding: '14px', borderRadius: '12px',
        background: '#0c2a4a', color: '#fff', border: 'none',
        fontSize: '14px', fontWeight: '500'
      }}>
        New quiz
      </button>
    </div>
  )
}

function HistoryTab({ history, loading, onRetry }) {
  if (loading) return (
    <div style={{ padding: '40px 16px', textAlign: 'center', color: '#888780', fontSize: '13px' }}>
      Loading your progress...
    </div>
  )

  if (!history) return (
    <div style={{ padding: '40px 16px', textAlign: 'center', color: '#888780', fontSize: '13px', fontStyle: 'italic' }}>
      No progress yet. Complete a quiz to start tracking your scores, sailor.
    </div>
  )

  const { sessions, categoryTotals } = history

  if (sessions.length === 0) return (
    <div style={{ padding: '40px 16px', textAlign: 'center', color: '#888780', fontSize: '13px', fontStyle: 'italic' }}>
      No progress yet. Complete a quiz to start tracking your scores, sailor.
    </div>
  )

  const avg = Math.round(sessions.reduce((s, r) => s + r.percentage, 0) / sessions.length)
  const recent5 = sessions.slice(0, 5)
  const recentAvg = Math.round(recent5.reduce((s, r) => s + r.percentage, 0) / recent5.length)
  const trend = sessions.length >= 2
    ? recentAvg - Math.round(sessions.slice(-5).reduce((s, r) => s + r.percentage, 0) / Math.min(5, sessions.length))
    : null

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
        {[
          { label: 'Sessions', value: sessions.length },
          { label: 'Avg score', value: `${avg}%` },
          { label: 'Trend', value: trend === null ? '—' : trend >= 0 ? `+${trend}%` : `${trend}%`, color: trend > 0 ? '#27500A' : trend < 0 ? '#791F1F' : '#5f5e5a' }
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '0.5px solid rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: s.color || '#185FA5' }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#888780', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            All-time by category
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(categoryTotals)
              .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
              .map(([cat, s]) => {
                const pct = Math.round((s.correct / s.total) * 100)
                const colors = CATEGORY_COLORS[cat] || { bg: '#f5f5f3', text: '#5f5e5a' }
                return (
                  <div key={cat} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '20px', background: colors.bg, color: colors.text, fontWeight: '500' }}>{cat}</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: pct >= 70 ? '#27500A' : '#791F1F' }}>{pct}% · {s.correct}/{s.total}</span>
                    </div>
                    <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 70 ? '#3B6D11' : '#A32D2D', borderRadius: '2px' }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Session history */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Recent sessions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {sessions.slice(0, 20).map(s => (
            <div key={s.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>
                  {s.score}/{s.total} correct
                </div>
                <div style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>
                  {new Date(s.date).toLocaleDateString()} · {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{
                fontSize: '18px', fontWeight: '700',
                color: s.percentage >= 70 ? '#27500A' : '#791F1F'
              }}>
                {s.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
