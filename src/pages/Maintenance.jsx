import { useState, useEffect, useRef } from 'react'
import { apiPost, uploadPhoto } from '../api'

const CATEGORIES = ['Engine', 'Electrical', 'Rigging', 'Hull', 'Fuel system', 'Plumbing', 'Safety gear', 'Navigation', 'Other']

const catColors = {
  Engine: { bg: '#FAEEDA', text: '#633806' },
  Electrical: { bg: '#FCEBEB', text: '#791F1F' },
  Rigging: { bg: '#E6F1FB', text: '#0C447C' },
  Hull: { bg: '#EAF3DE', text: '#27500A' }
}

export default function Maintenance({ userId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingPhotos, setPendingPhotos] = useState([])
  const fileRef = useRef()
  const [form, setForm] = useState({
    description: '', category: 'Engine',
    date: new Date().toISOString().split('T')[0],
    engineHoursAtService: '', nextDueEngineHours: '',
    cost: '', laborHours: '', technician: 'Owner', notes: ''
  })

  useEffect(() => { loadEntries() }, [])

  async function loadEntries() {
    setLoading(true)
    try {
      const data = await apiPost('logbook', { action: 'getMaintenance', userId })
      setEntries(data.entries || [])
    } catch (e) {}
    finally { setLoading(false) }
  }

  function onFilesSelected(e) {
    const files = Array.from(e.target.files)
    const previews = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setPendingPhotos(p => [...p, ...previews])
    e.target.value = ''
  }

  function removePhoto(index) {
    setPendingPhotos(p => {
      URL.revokeObjectURL(p[index].preview)
      return p.filter((_, i) => i !== index)
    })
  }

  async function saveEntry() {
    if (!form.description) return
    setSaving(true)
    try {
      const photoUrls = await Promise.all(pendingPhotos.map(p => uploadPhoto(userId, p.file)))
      await apiPost('logbook', {
        action: 'logMaintenance',
        userId,
        description: form.description,
        category: form.category,
        date: form.date,
        technician: form.technician,
        notes: form.notes,
        engineHoursAtService: parseFloat(form.engineHoursAtService) || 0,
        nextDueEngineHours: parseFloat(form.nextDueEngineHours) || null,
        cost: parseFloat(form.cost) || 0,
        laborHours: parseFloat(form.laborHours) || 0,
        photos: photoUrls
      })
      setShowForm(false)
      setPendingPhotos([])
      setForm({
        description: '', category: 'Engine',
        date: new Date().toISOString().split('T')[0],
        engineHoursAtService: '', nextDueEngineHours: '',
        cost: '', laborHours: '', technician: 'Owner', notes: ''
      })
      loadEntries()
    } catch (e) {}
    finally { setSaving(false) }
  }

  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '14px',
    background: '#f5f5f3', fontFamily: 'inherit', outline: 'none'
  }

  return (
    <div>
      <div style={{ background: '#0c2a4a', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#fff', fontSize: '17px', fontWeight: '600' }}>Maintenance Log</div>
        <button onClick={() => { setShowForm(!showForm); setPendingPhotos([]) }} style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff', padding: '7px 14px', borderRadius: '20px', fontSize: '13px'
        }}>
          {showForm ? 'Cancel' : '+ Log work'}
        </button>
      </div>

      {showForm && (
        <div style={{ margin: '12px 16px', background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.12)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#0c2a4a' }}>New maintenance entry</div>
          <div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Description</div>
            <input style={inp} placeholder="Oil and filter change" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Category</div>
              <select style={inp} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Date</div>
              <input type="date" style={inp} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Engine hrs at service</div>
              <input type="number" style={inp} placeholder="847" value={form.engineHoursAtService} onChange={e => setForm(p => ({ ...p, engineHoursAtService: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Next due (engine hrs)</div>
              <input type="number" style={inp} placeholder="947" value={form.nextDueEngineHours} onChange={e => setForm(p => ({ ...p, nextDueEngineHours: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Cost ($)</div>
              <input type="number" style={inp} placeholder="0" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Labor hours</div>
              <input type="number" step="0.5" style={inp} placeholder="0" value={form.laborHours} onChange={e => setForm(p => ({ ...p, laborHours: e.target.value }))} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Technician</div>
            <select style={inp} value={form.technician} onChange={e => setForm(p => ({ ...p, technician: e.target.value }))}>
              <option>Owner</option>
              <option>Marina</option>
              <option>Mobile mechanic</option>
              <option>Yard</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Notes</div>
            <textarea style={{ ...inp, minHeight: '72px', resize: 'vertical' }} placeholder="Part numbers, observations..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '8px' }}>Photos</div>
            {pendingPhotos.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {pendingPhotos.map((p, i) => (
                  <div key={i} style={{ position: 'relative', width: '72px', height: '72px' }}>
                    <img src={p.preview} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px' }} />
                    <button onClick={() => removePhoto(i)} style={{
                      position: 'absolute', top: '-6px', right: '-6px',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: '#A32D2D', color: '#fff', border: 'none',
                      fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onFilesSelected} />
            <button onClick={() => fileRef.current.click()} style={{
              padding: '8px 14px', borderRadius: '8px', background: '#f5f5f3',
              border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '13px', color: '#5f5e5a', cursor: 'pointer'
            }}>
              + Add photos
            </button>
          </div>

          <button onClick={saveEntry} disabled={saving} style={{
            padding: '12px', borderRadius: '10px', background: '#0c2a4a',
            color: '#fff', border: 'none', fontSize: '14px', fontWeight: '500',
            opacity: saving ? 0.7 : 1
          }}>
            {saving ? 'Uploading...' : 'Log this work'}
          </button>
        </div>
      )}

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#888780', fontSize: '13px' }}>
            Loading maintenance log...
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#888780', fontSize: '13px', fontStyle: 'italic' }}>
            No maintenance logged. A well-kept boat is a safe boat, sailor.
          </div>
        ) : entries.map(entry => {
          const cat = catColors[entry.category] || { bg: '#f5f5f3', text: '#5f5e5a' }
          return (
            <div key={entry.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  &#128295;
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>{entry.description}</div>
                  <div style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>
                    {new Date(entry.date).toLocaleDateString()} &middot; {entry.technician}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: cat.bg, color: cat.text, fontWeight: '500' }}>
                      {entry.category}
                    </span>
                    {entry.engineHoursAtService > 0 ? (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#f5f5f3', color: '#5f5e5a', fontWeight: '500' }}>
                        @ {entry.engineHoursAtService} hrs
                      </span>
                    ) : null}
                    {entry.cost > 0 ? (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#f5f5f3', color: '#5f5e5a', fontWeight: '500' }}>
                        ${entry.cost}
                      </span>
                    ) : null}
                  </div>
                  {entry.nextDueEngineHours ? (
                    <div style={{ fontSize: '11px', color: '#854F0B', marginTop: '6px' }}>
                      Next due: {entry.nextDueEngineHours} engine hrs
                    </div>
                  ) : null}
                  {entry.photos && entry.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {entry.photos.map((url, i) => (
                        <img key={i} src={url} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px' }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
