import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { searchNearby, hasPlacesKey } from '../lib/places'
import { getSettings } from '../lib/settings'
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
  const [nearbyCtx, setNearbyCtx] = useState('')
  const bottomRef = useRef(null)

  // Give the AI real, current venue data so its suggestions are specific, not generic
  useEffect(() => {
    let liveFlag = true
    ;(async () => {
      if (!hasPlacesKey() || !profile?.lat || !profile?.lng) return
      if (!getSettings(profile.id).aiUseLocation) return
      const [food, fun] = await Promise.all([
        searchNearby({ lat: profile.lat, lng: profile.lng, types: ['restaurant', 'cafe'], radius: 4000, max: 8 }),
        searchNearby({ lat: profile.lat, lng: profile.lng, types: ['park', 'movie_theater', 'bowling_alley', 'tourist_attraction'], radius: 9000, max: 6 }),
      ])
      if (!liveFlag) return
      const fmt = v => `${v.name} (${v.type || 'venue'}, ${v.rating ?? '?'} stars, ${v.dist ?? '?'} away${v.openNow === false ? ', closed right now' : ''})`
      const parts = []
      if (food?.length) parts.push('PLACES TO EAT NEARBY: ' + food.map(fmt).join('; '))
      if (fun?.length) parts.push('THINGS TO DO NEARBY: ' + fun.map(fmt).join('; '))
      setNearbyCtx(parts.join('\n'))
    })()
    return () => { liveFlag = false }
  }, [profile?.lat, profile?.lng])

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
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system: `You are Outly AI, the assistant inside Outly, a hangout planning app for young people in Sydney.
STYLE RULES (strict):
- PLAIN TEXT ONLY. Never use markdown: no asterisks, no bold, no headings, no bullet symbols. The chat shows raw text, so any * characters look broken.
- Keep replies under 110 words. Short lines. Casual and friendly, a couple of emojis max.
- Always end with one short question that moves the plan forward.
USER PROFILE:
- Budget: ${profile?.budget ?? 'unknown'} per person. Food tastes: ${profile?.food_preferences?.join(', ') ?? 'unknown'}.
- Allergies and dietary needs: ${profile?.allergies?.length ? profile.allergies.join(', ') : 'none listed'}. NEVER suggest food or venues that conflict with these.
- Location: ${profile?.lat ? `live location known (around ${profile.lat.toFixed(3)}, ${profile.lng.toFixed(3)}, Western Sydney)` : profile?.postcode ? `postcode ${profile.postcode} area, Western Sydney` : 'Western Sydney'}.
${nearbyCtx ? `REAL VENUES NEAR THE USER RIGHT NOW (live from Google, with distance from them):\n${nearbyCtx}\nWhen suggesting where to eat or what to do, recommend 2 or 3 specific venues FROM THIS LIST, mention their distance, and say in a few words why each fits their tastes, budget and allergies. Do not invent venues that are not in the list.` : 'You have no live venue data right now, so suggest cuisine types or activity ideas and tell them the Dine and Discover tabs have live options near them.'}`,
          messages: newMsgs.map(m => ({ role: m.role, content: m.text }))
        })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text
        ?? (data.error?.message ? `⚠️ ${data.error.message}` : 'Something went wrong — your message is back in the box, tap send to retry.')
      if (!data.content?.[0]?.text) setInput(text)
      setMsgs(m => [...m, { role: 'assistant', text: reply }])
    } catch {
      setInput(text)
      setMsgs(m => [...m, { role: 'assistant', text: 'Network hiccup — your message is back in the box, tap send to retry.' }])
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
