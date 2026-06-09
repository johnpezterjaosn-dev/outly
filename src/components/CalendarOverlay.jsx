import { useState } from 'react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const FREE = [7,14,21,28]
const EVENTS = [3,10,17]

export default function CalendarOverlay({ onClose }) {
  const [m, setM] = useState(5)
  const [y, setY] = useState(2026)
  const [sel, setSel] = useState(null)

  function nav(dir) {
    let nm = m + dir, ny = y
    if (nm > 11) { nm = 0; ny++ }
    if (nm < 0) { nm = 11; ny-- }
    setM(nm); setY(ny)
  }

  const first = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const today = new Date()

  return (
    <div className="overlay">
      <div className="ovhead">
        <button className="ovback" onClick={onClose}><i className="ti ti-arrow-left" style={{ fontSize: 18, color: '#fff' }} /></button>
        <div className="ovtitle">Pick a Date</div>
        <span className="ovsave" onClick={onClose}>Done</span>
      </div>
      <div className="ovscroll">
        {/* Google Calendar connect */}
        <div onClick={() => alert('Connect Google Calendar — coming soon!')} style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, cursor: 'pointer' }}>
          <svg width="28" height="28" viewBox="0 0 24 24"><path d="M19.5 3h-3V1.5h-1.5V3h-7.5V1.5H6V3H2.5A1.5 1.5 0 001 4.5v15A1.5 1.5 0 002.5 21h17a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm0 16.5h-17V9h17v10.5z" fill="#4285F4"/></svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Connect Google Calendar</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Let AI see your free days automatically</div>
          </div>
          <i className="ti ti-chevron-right" style={{ fontSize: 16, color: '#555' }} />
        </div>

        {/* Cal nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 12px' }}>
          <button className="ovback" onClick={() => nav(-1)}><i className="ti ti-chevron-left" style={{ fontSize: 16, color: '#fff' }} /></button>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{MONTHS[m]} {y}</div>
          <button className="ovback" onClick={() => nav(1)}><i className="ti ti-chevron-right" style={{ fontSize: 16, color: '#fff' }} /></button>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#555', padding: '4px 0' }}>{d}</div>
          ))}
          {Array(first).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: days }, (_, i) => i + 1).map(d => {
            const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear()
            const isFree = FREE.includes(d)
            const isSel = sel === d
            return (
              <div key={d} onClick={() => setSel(d)} style={{
                height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, fontSize: 14, cursor: 'pointer', position: 'relative',
                background: isSel ? '#FF6B35' : isFree ? 'rgba(255,107,53,0.1)' : 'transparent',
                color: isSel ? '#fff' : isFree ? '#FF6B35' : isToday ? '#fff' : '#ccc',
                fontWeight: (isToday || isSel) ? 700 : 400,
              }}>
                {d}
                {isToday && !isSel && <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#FF6B35' }} />}
                {EVENTS.includes(d) && !isSel && <div style={{ position: 'absolute', top: 3, right: 5, width: 4, height: 4, borderRadius: '50%', background: '#FF6B35', opacity: 0.5 }} />}
              </div>
            )
          })}
        </div>

        {sel && (
          <>
            <div style={{ background: '#1a1a1a', borderRadius: 14, padding: '14px 16px', marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                {DAYS[new Date(y, m, sel).getDay()]} {sel} {MONTHS[m]}
              </div>
              {[
                { c: '#FF6B35', t: "You're free all day" },
                { c: '#5b8dee', t: 'Kyle — free from 2pm' },
                { c: '#e74c3c', t: 'Sarah — busy until 1pm' },
                { c: '#3aad6e', t: 'Marcus — free all day' },
              ].map((r, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < arr.length - 1 ? '0.5px solid #222' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.c, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#aaa' }}>{r.t}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <i className="ti ti-sparkles" style={{ fontSize: 16, color: '#FF6B35' }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>AI Picks for this date</div>
              </div>
              {[
                { name: 'Pho House + Timezone', meta: "Best match · Everyone's free · $18pp", tags: ['✦ AI Pick','Budget ✓','3 votes'] },
                { name: 'Bento Bros + Archie Brothers', meta: 'Popular with your group · $20pp', tags: ['✦ AI Pick','Japanese'] },
              ].map(r => (
                <div key={r.name} style={{ background: '#161616', border: '0.5px solid rgba(255,107,53,0.2)', borderRadius: 14, padding: '12px 14px', marginBottom: 8, cursor: 'pointer' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{r.meta}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {r.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
              ))}
              <button className="btn btn-o" onClick={() => alert('Hangout added to calendar! 🎉')}>Confirm & Add to Calendar 🎉</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
