import { useState, useEffect } from 'react'
import { apiPost } from '../api'

export default function Quiz() {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [grading, setGrading] = useState(false)

  useEffect(() => { loadQuestions() }, [])

  async function loadQuestions() {
    setLoading(true)
    try {
      const data = await apiPost('quiz', { action: 'get', count: 5 })
      setQuestions(data.questions || [])
      setCurrent(0)
      setSelected(null)
      setResult(null)
      setScore({ correct: 0, total: 0 })
    } catch (e) {}
    finally { setLoading(false) }
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
      setScore(s => ({ correct: s.correct + (data.correct ? 1 : 0), total: s.total + 1 }))
    } catch (e) {
      setResult({ correct: false, explanation: 'Could not reach the Captain. Try again.' })
    } finally {
      setGrading(false)
    }
  }

  function next() {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1)
      setSelected(null)
      setResult(null)
    } else {
      setCurrent(-1)
    }
  }

  if (loading) return (
    <div style={{ padding: '40px 16px', textAlign: 'center', color: '#888780' }}>
      Captain Cole is preparing your questions...
    </div>
  )

  if (current === -1) return (
    <div style={{ padding: '40px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>
        {score.correct === score.total ? '⚓' : score.correct >= score.total / 2 ? '🧭' : '📚'}
      </div>
      <div style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>
        {score.correct} of {score.total} correct
      </div>
      <div style={{ fontSize: '14px', color: '#5f5e5a', marginBottom: '8px', fontStyle: 'italic' }}>
        {score.correct === score.total
          ? "Outstanding, sailor. You know your rules cold."
          : score.correct >= score.total / 2
          ? "Not bad — but the sea doesn't grade on a curve. Study those misses."
          : "Back to the books, sailor. Lives depend on knowing this cold."}
      </div>
      <button onClick={loadQuestions} style={{
        marginTop: '16px', padding: '12px 28px', borderRadius: '24px',
        background: '#185FA5', color: '#fff', border: 'none', fontSize: '14px', fontWeight: '500'
      }}>
        Try again
      </button>
    </div>
  )

  const q = questions[current]
  if (!q) return null

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#888780' }}>Question {current + 1} of {questions.length}</div>
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#185FA5' }}>{score.correct}/{score.total} correct</div>
      </div>

      <div style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', marginBottom: '24px' }}>
        <div style={{ height: '100%', width: `${(current / questions.length) * 100}%`, background: '#185FA5', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ fontSize: '11px', fontWeight: '500', color: '#888780', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {q.category} &middot; {q.difficulty}
      </div>

      <div style={{ fontSize: '16px', fontWeight: '500', lineHeight: '1.5', marginBottom: '24px', color: '#1a1a1a' }}>
        {q.question}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {q.options.map((opt, i) => {
          let bg = '#fff', border = '0.5px solid rgba(0,0,0,0.15)', color = '#1a1a1a'
          if (selected !== null && result) {
            if (i === result.correctAnswer) { bg = '#EAF3DE'; border = '1.5px solid #3B6D11'; color = '#27500A' }
            else if (i === selected && !result.correct) { bg = '#FCEBEB'; border = '1.5px solid #A32D2D'; color = '#791F1F' }
          }
          return (
            <button key={i} onClick={() => grade(i)} disabled={selected !== null} style={{
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
          padding: '14px 16px', marginBottom: '16px',
          background: result.correct ? '#EAF3DE' : '#FCEBEB',
          borderLeft: `4px solid ${result.correct ? '#3B6D11' : '#A32D2D'}`,
          borderRadius: '0 12px 12px 0',
          fontSize: '13px', lineHeight: '1.6',
          color: result.correct ? '#27500A' : '#791F1F'
        }}>
          {result.explanation}
        </div>
      )}

      {result && (
        <button onClick={next} style={{
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
