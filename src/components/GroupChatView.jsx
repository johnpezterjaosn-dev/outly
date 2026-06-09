import { useState } from 'react'
import CalendarOverlay from './CalendarOverlay'

function OA({ s = 28 }) {
  return <div className="oa-wrap" style={{ width: s, height: s, flexShrink: 0 }}><span className="oa-text" style={{ fontSize: s * 0.32 }}>OA</span></div>
}

const OPTS = [
  { name: 'Pho House + Timezone', sub: 'Vietnamese · Arcade · ~$18pp' },
  { name: "Gigi's + Event Cinemas", sub: 'Pizza · Movie · ~$22pp' },
  { name: 'Bento Bros + Archie Brothers', sub: 'Japanese · Retro arcade · ~$20pp' },
]

export default function GroupChatView({ onBack }) {
  const [votes, setVotes] = useState([2, 1, 1])
  const [voted, setVoted] = useState(null)
  const [showCal, setShowCal] = useState(false)

  function castVote(i) {
    if (voted !== null) return
    setVoted(i)
    setVotes(v => v.map((x, idx) => idx === i ? x + 1 : x))
  }

  const total = votes.reduce((a, b) => a + b, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#111', borderBottom: '0.5px solid #2a2a2a', flexShrink: 0 }}>
        <button className="ovback" onClick={onBack}><i className="ti ti-arrow-left" style={{ fontSize: 18, color: '#fff' }} /></button>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏀</div>
        <div style={{ flex: 1, marginLeft: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Weekend Squad</div>
          <div style={{ fontSize: 12, color: '#666' }}>Kyle, Sarah, Marcus, Zara + you</div>
        </div>
        <button className="ovback" onClick={() => setShowCal(true)}><i className="ti ti-calendar" style={{ fontSize: 18, color: '#FF6B35' }} /></button>
      </div>

      <div className="msgs">
        <div style={{ textAlign: 'center', fontSize: 11, color: '#555' }}>Today</div>
        <div className="mrow"><div style={{ width: 28, height: 28, borderRadius: '50%', background: '#5b8dee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>KL</div><div className="bub them">guys what are we doing Saturday?</div></div>
        <div className="mrow"><div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>SM</div><div className="bub them">food + something after pls 🙏</div></div>

        <div className="mrow">
          <OA s={28} />
          <div>
            <div className="ailabel">OUTLY AI</div>
            <div className="bub ai" style={{ marginBottom: 8 }}>I've put together a vote based on everyone's budgets and prefs 👇</div>
            {/* Vote card */}
            <div style={{ background: '#161616', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 16, padding: 14, maxWidth: 260 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>🗳 Where should we go Saturday?</div>
              {OPTS.map((opt, i) => {
                const pct = Math.round((votes[i] / total) * 100)
                return (
                  <div key={i} onClick={() => castVote(i)} style={{
                    background: '#0d0d0d', borderRadius: 10, padding: '10px 12px', marginBottom: 6,
                    cursor: voted === null ? 'pointer' : 'default', position: 'relative', overflow: 'hidden',
                    border: `1px solid ${voted === i ? '#FF6B35' : '#2a2a2a'}`
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct}%`, background: 'rgba(255,107,53,0.12)', transition: 'width 0.4s' }} />
                    <div style={{ position: 'relative', zIndex: 1, fontSize: 13, fontWeight: 500, color: '#fff' }}>{opt.name}</div>
                    <div style={{ position: 'relative', zIndex: 1, fontSize: 11, color: '#666', marginTop: 2 }}>{opt.sub}</div>
                    <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: '#FF6B35', zIndex: 1 }}>{pct}%</div>
                  </div>
                )
              })}
              <div style={{ fontSize: 11, color: '#555', textAlign: 'right', marginTop: 8 }}>
                {total} votes · {voted !== null ? 'You voted!' : '1 left'}
              </div>
            </div>
          </div>
        </div>

        <div className="mrow me"><div className="bub me">AI put together good options ngl 🔥</div></div>
        <div className="mrow"><div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3aad6e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>MR</div><div className="bub them">voted! pho house go hard</div></div>
      </div>

      <div className="ibar">
        <div className="iai-btn" onClick={() => setShowCal(true)}><span className="oa-text" style={{ fontSize: 9, color: '#FF6B35', fontWeight: 900 }}>OA</span></div>
        <input className="iinput" placeholder="Message Weekend Squad..." />
        <button className="isend"><i className="ti ti-send" /></button>
      </div>

      {showCal && <CalendarOverlay onClose={() => setShowCal(false)} />}
    </div>
  )
}
