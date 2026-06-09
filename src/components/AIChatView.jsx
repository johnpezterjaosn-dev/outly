import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import CalendarOverlay from './CalendarOverlay'

function OA({ s = 28 }) {
  return (
    <div className="oa-wrap" style={{ width: s, height: s, flexShrink: 0 }}>
      <span className="oa-text" style={{ fontSize: s * 0.32 }}>OA</span>
    </div>
  )
}

export default function AIChatView({ onBack }) {
  const { profile } = useAuth()
  const name = profile?.first_name ?? 'there'
  const [msgs, setMsgs] = useState([
    { role: 'assistant', text: `Hey ${name}! 👋 I can help plan your next hangout. Want me to suggest some places for this weekend?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCal, setShowCal] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const newMsgs = [...msgs, { role: 'user', text }]
    setMsgs(newMsgs)
    setLoading(true)

    const key = import.meta.env.VITE_ANTHROPIC_KEY
    if (!key || key === 'placeholder') {
      setTimeout(() => {
        setMsgs(m => [...m, { role: 'assistant', text: "On it! Let me check what's available 📍\n\n*(Add your Anthropic API key to enable real AI — see README)*" }])
        setLoading(false)
      }, 700)
      return
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          system: `You are Outly AI — a casual, friendly hangout planner. Help the user find restaurants and activities to do with friends. Be short, chat-style, use emojis naturally. User budget: ${profile?.budget ?? 'unknown'}. Food prefs: ${profile?.food_preferences?.join(', ') ?? 'unknown'}. Location: Western Sydney area.`,
          messages: newMsgs.map(m => ({ role: m.role, content: m.text }))
        })
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'assistant', text: data.content?.[0]?.text ?? 'Something went wrong, try again.' }])
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: 'Something went wrong, try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#111', borderBottom: '0.5px solid #2a2a2a', flexShrink: 0 }}>
        <button onClick={onBack} className="ovback"><i className="ti ti-arrow-left" style={{ fontSize: 18, color: '#fff' }} /></button>
        <OA s={38} />
        <div style={{ flex: 1, marginLeft: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Outly AI</div>
          <div style={{ fontSize: 12, color: '#666' }}>Your hangout planner</div>
        </div>
        <button className="ovback" onClick={() => setShowCal(true)}><i className="ti ti-calendar" style={{ fontSize: 18, color: '#FF6B35' }} /></button>
      </div>

      <div className="msgs">
        {msgs.map((m, i) => (
          <div key={i} className={`mrow ${m.role === 'user' ? 'me' : ''}`}>
            {m.role === 'assistant' && <OA s={28} />}
            <div>
              {m.role === 'assistant' && <div className="ailabel">OUTLY AI</div>}
              <div className={`bub ${m.role === 'user' ? 'me' : 'ai'}`}>{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="mrow">
            <OA s={28} />
            <div>
              <div className="ailabel">OUTLY AI</div>
              <div className="bub ai" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B35', animation: `bounce 1.2s ${i*0.2}s infinite ease-in-out` }} />)}
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="ibar">
        <div className="iai-btn"><span className="oa-text" style={{ fontSize: 9, color: '#FF6B35', fontWeight: 900 }}>OA</span></div>
        <input className="iinput" placeholder="Ask AI anything..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        <button className="isend" onClick={send}><i className="ti ti-send" /></button>
      </div>

      {showCal && <CalendarOverlay onClose={() => setShowCal(false)} />}
      <style>{`@keyframes bounce { 0%,60%,100% { transform: translateY(0) } 30% { transform: translateY(-6px) } }`}</style>
    </div>
  )
}
