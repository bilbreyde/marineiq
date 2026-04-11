import { useState, useEffect, useRef } from 'react'
import { apiPost, uploadPhoto } from '../api'
import { downloadCSV, parseCSV } from '../csvUtils'
import { useVessel } from '../contexts/VesselContext'

const CATEGORIES = ['Engine', 'Electrical', 'Rigging', 'Hull', 'Fuel system', 'Plumbing', 'Safety gear', 'Navigation', 'Other']

const catColors = {
  Engine: { bg: '#FAEEDA', text: '#633806' },
  Electrical: { bg: '#FCEBEB', text: '#791F1F' },
  Rigging: { bg: '#E6F1FB', text: '#0C447C' },
  Hull: { bg: '#EAF3DE', text: '#27500A' },
  'Fuel system': { bg: '#FEF3C7', text: '#92400E' },
  Plumbing: { bg: '#E0F2FE', text: '#075985' },
  'Safety gear': { bg: '#FCE7F3', text: '#9D174D' },
  Navigation: { bg: '#EDE9FE', text: '#5B21B6' },
  Other: { bg: '#f5f5f3', text: '#5f5e5a' }
}

export default function Parts({ userId }) {
  const { vessel } = useVessel()
  const vesselId = vessel?.id
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const fileRef = useRef()
  const csvRef = useRef()
  const [importing, setImporting] = useState(false)
  const [pendingPhotos, setPendingPhotos] = useState([])
  const [form, setForm] = useState({
    name: '', manufacturer: '', partNumber: '',
    category: 'Engine', installDate: new Date().toISOString().split('T')[0], notes: ''
  })

  useEffect(() => { if (vesselId) loadParts() }, [vesselId])

  async function loadParts() {
    setLoading(true)
    try {
      const data = await apiPost('logbook', { action: 'getParts', userId, vesselId })
      setParts(data.parts || [])
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

  async function savePart() {
    if (!form.name) return
    setSaving(true)
    try {
      const photoUrls = await Promise.all(pendingPhotos.map(p => uploadPhoto(userId, p.file)))
      await apiPost('logbook', {
        action: 'logPart',
        userId, vesselId,
        name: form.name,
        manufacturer: form.manufacturer,
        partNumber: form.partNumber,
        category: form.category,
        installDate: form.installDate,
        notes: form.notes,
        photos: photoUrls
      })
      setShowForm(false)
      setPendingPhotos([])
      setForm({
        name: '', manufacturer: '', partNumber: '',
        category: 'Engine', installDate: new Date().toISOString().split('T')[0], notes: ''
      })
      loadParts()
    } catch (e) {}
    finally { setSaving(false) }
  }

  function downloadParts() {
    const rows = parts.map(p => ({
      name: p.name,
      manufacturer: p.manufacturer || '',
      partNumber: p.partNumber || '',
      category: p.category,
      installDate: p.installDate || '',
      notes: p.notes || ''
    }))
    downloadCSV('parts.csv', rows)
  }

  async function importParts(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    setImporting(true)
    try {
      const rows = parseCSV(await file.text())
      for (const row of rows) {
        await apiPost('logbook', {
          action: 'logPart', userId, vesselId,
          name: row.name || '',
          manufacturer: row.manufacturer || '',
          partNumber: row.partNumber || '',
          category: row.category || 'Engine',
          installDate: row.installDate || new Date().toISOString().split('T')[0],
          notes: row.notes || ''
        })
      }
      loadParts()
    } catch (e) {}
    finally { setImporting(false) }
  }

  const filtered = search.trim()
    ? parts.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.partNumber?.toLowerCase().includes(search.toLowerCase()) ||
        p.manufacturer?.toLowerCase().includes(search.toLowerCase())
      )
    : parts

  // Group by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(p => p.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '0.5px solid rgba(0,0,0,0.2)', fontSize: '14px',
    background: '#f5f5f3', fontFamily: 'inherit', outline: 'none'
  }

  return (
    <div>
      <div style={{ background: '#0c2a4a', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#fff', fontSize: '17px', fontWeight: '600' }}>Parts Library</div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button onClick={downloadParts} disabled={!parts.length} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', padding: '7px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer'
          }}>⬇ CSV</button>
          <button onClick={() => csvRef.current.click()} disabled={importing} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', padding: '7px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer'
          }}>{importing ? '...' : '⬆ CSV'}</button>
          <input ref={csvRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={importParts} />
          <button onClick={() => { setShowForm(!showForm); setPendingPhotos([]) }} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', padding: '7px 14px', borderRadius: '20px', fontSize: '13px'
          }}>
            {showForm ? 'Cancel' : '+ Add part'}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ margin: '12px 16px', background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.12)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#0c2a4a' }}>New part</div>
          <div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Part name</div>
            <input style={inp} placeholder="Racor 500 fuel filter" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Manufacturer</div>
              <input style={inp} placeholder="Racor" value={form.manufacturer} onChange={e => setForm(p => ({ ...p, manufacturer: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Part number</div>
              <input style={inp} placeholder="S3227" value={form.partNumber} onChange={e => setForm(p => ({ ...p, partNumber: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Category</div>
              <select style={inp} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Install date</div>
              <input type="date" style={inp} value={form.installDate} onChange={e => setForm(p => ({ ...p, installDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '4px' }}>Notes</div>
            <textarea style={{ ...inp, minHeight: '60px', resize: 'vertical' }} placeholder="Compatible models, where sourced, specs..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
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
          <button onClick={savePart} disabled={saving} style={{
            padding: '12px', borderRadius: '10px', background: '#0c2a4a',
            color: '#fff', border: 'none', fontSize: '14px', fontWeight: '500',
            opacity: saving ? 0.7 : 1
          }}>
            {saving ? 'Uploading...' : 'Add to library'}
          </button>
        </div>
      )}

      <div style={{ padding: '12px 16px 8px' }}>
        <input
          style={{ ...inp, background: '#fff' }}
          placeholder="Search parts, part numbers, manufacturers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#888780', fontSize: '13px' }}>
            Loading parts library...
          </div>
        ) : parts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#888780', fontSize: '13px', fontStyle: 'italic' }}>
            No parts logged yet. Start building your ship's inventory, sailor.
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#888780', fontSize: '13px' }}>
            No parts match "{search}"
          </div>
        ) : Object.entries(grouped).map(([cat, items]) => {
          const colors = catColors[cat] || catColors.Other
          return (
            <div key={cat} style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                {cat} <span style={{ fontWeight: '400' }}>· {items.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {items.map(part => (
                  <div key={part.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>{part.name}</div>
                        {part.manufacturer && (
                          <div style={{ fontSize: '11px', color: '#5f5e5a', marginTop: '2px' }}>{part.manufacturer}</div>
                        )}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: colors.bg, color: colors.text, fontWeight: '500' }}>
                            {cat}
                          </span>
                          {part.partNumber && (
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#f5f5f3', color: '#5f5e5a', fontWeight: '500', fontFamily: 'monospace' }}>
                              {part.partNumber}
                            </span>
                          )}
                          {part.installDate && (
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#f5f5f3', color: '#888780' }}>
                              Installed {new Date(part.installDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {part.notes && (
                          <div style={{ fontSize: '11px', color: '#888780', marginTop: '6px', fontStyle: 'italic' }}>{part.notes}</div>
                        )}
                        {part.photos && part.photos.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {part.photos.map((url, i) => (
                              <img key={i} src={url} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px' }} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
