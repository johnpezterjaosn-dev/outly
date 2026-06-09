import { useState } from 'react'

const TYPES = [
  { e: '🍔', l: 'Dine out' }, { e: '🎮', l: 'Activity' },
  { e: '🌿', l: 'Outdoors' }, { e: '🎬', l: 'Cinema' },
]

export default function CreateHangoutOverlay({ onClose, friends = [] }) {
  const [name, setName] = useState('')
  const [type, setType] = useState(null)
  const [dt, setDt] = useState('')
  const [loc, setLoc] = useState('')
  const [invited, setInvited] = useState([])

  function toggle(i) {
    setInvited(f => f.includes(i) ? f.filter(x => x !== i) : [...f, i])
  }

  return (
    <div className="overlay">
      <div className="ovhead">
        <button className="ovback" onClick={onClose}><i className="ti ti-arrow-left" style={{ fontSize: 18, color: '#fff' }} /></button>
        <div className="ovtitle">Create Hangout</div>
      </div>
      <div className="ovscroll">
        <div style={{ marginTop: 20 }}>
          <div className="flabel">Hangout name</div>
          <input className="finput" placeholder="e.g. Saturday session 🔥" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="flabel">Type</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TYPES.map(t => (
              <div key={t.l} onClick={() => setType(t.l)} style={{
                background: type === t.l ? 'rgba(255,107,53,0.1)' : '#1a1a1a',
                border: `1.5px solid ${type === t.l ? '#FF6B35' : '#2a2a2a'}`,
                borderRadius: 12, padding: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span>{t.e}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: type === t.l ? '#FF6B35' : '#aaa' }}>{t.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="flabel">Date & time</div>
          <input className="finput" type="datetime-local" value={dt} onChange={e => setDt(e.target.value)} style={{ color: '#aaa' }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="flabel">Location</div>
          <input className="finput" placeholder="Search a place..." value={loc} onChange={e => setLoc(e.target.value)} />
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="flabel">Invite friends</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {friends.map(f => (
              <div key={f.i} onClick={() => toggle(f.i)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: invited.includes(f.i) ? 'rgba(255,107,53,0.1)' : '#1e1e1e',
                border: `1.5px solid ${invited.includes(f.i) ? '#FF6B35' : '#2a2a2a'}`,
                borderRadius: 50, padding: '6px 12px', cursor: 'pointer'
              }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: f.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{f.i}</div>
                <span style={{ fontSize: 13, color: invited.includes(f.i) ? '#FF6B35' : '#aaa', fontWeight: 500 }}>{f.n}</span>
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-o" style={{ marginTop: 28 }} onClick={() => { alert(`Hangout "${name || 'Unnamed'}" created! 🎉`); onClose() }}>
          Create Hangout 🎉
        </button>
      </div>
    </div>
  )
}
