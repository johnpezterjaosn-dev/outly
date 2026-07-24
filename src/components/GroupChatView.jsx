import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import CalendarOverlay from './CalendarOverlay'
import { searchNearby, hasPlacesKey } from '../lib/places'
import { getSettings } from '../lib/settings'

const PAL = ['#5b8dee', '#e74c3c', '#3aad6e', '#c9a227', '#9b59b6']

function initials(name = '') {
  const p = name.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '?') + (p[1]?.[0] ?? '')).toUpperCase()
}

export default function GroupChatView({ hangout, onBack }) {
  const { user, profile } = useAuth()
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState('')
  const [showCal, setShowCal] = useState(false)
  const [aiBusy, setAiBusy] = useState(false)
  const [nearbyCtx, setNearbyCtx] = useState('')
  const bottomRef = useRef(null)

  const myName = profile?.first_name || profile?.username || 'You'

  // Load existing messages, then subscribe for live updates
  useEffect(() => {
    let alive = true
    async function load() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('hangout_id', hangout.id)
        .order('created_at', { ascending: true })
      if (!alive) return
      if (error) setErr(error.message)
      else setMsgs(data ?? [])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('messages-' + hangout.id)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `hangout_id=eq.${hangout.id}` },
        payload => {
          setMsgs(m => m.some(x => x.id === payload.new.id) ? m : [...m, payload.new])
        })
      .subscribe()

    return () => { alive = false; supabase.removeChannel(channel) }
  }, [hangout.id])

  // Live venues near the group, so the assistant recommends real places
  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!hasPlacesKey() || !profile?.lat || !profile?.lng) return
      if (!getSettings(profile.id).aiUseLocation) return
      const [food, fun] = await Promise.all([
        searchNearby({ lat: profile.lat, lng: profile.lng, types: ['restaurant', 'cafe'], radius: 4000, max: 8 }),
        searchNearby({ lat: profile.lat, lng: profile.lng, types: ['park', 'movie_theater', 'bowling_alley', 'tourist_attraction'], radius: 9000, max: 6 }),
      ])
      if (!alive) return
      const fmt = v => v.name + ' (' + (v.type || 'venue') + ', ' + (v.rating ?? '?') + ' stars, ' + (v.dist ?? '?') + ' away' + (v.openNow === false ? ', closed right now' : '') + ')'
      const parts = []
      if (food?.length) parts.push('PLACES TO EAT NEARBY: ' + food.map(fmt).join('; '))
      if (fun?.length) parts.push('THINGS TO DO NEARBY: ' + fun.map(fmt).join('; '))
      setNearbyCtx(parts.join('\n'))
    })()
    return () => { alive = false }
  }, [profile?.lat, profile?.lng])

  // Bring Outly AI into the group chat to help the group decide
  async function askAI() {
    if (aiBusy) return
    const question = input.trim()
    setInput('')
    setAiBusy(true)
    setErr('')

    let history = msgs
    if (question) {
      const { data } = await supabase.from('messages').insert({
        hangout_id: hangout.id, user_id: user.id, sender_name: myName, content: question,
      }).select().single()
      if (data) {
        history = [...msgs, data]
        setMsgs(m => m.some(x => x.id === data.id) ? m : [...m, data])
      }
    }

    const key = import.meta.env.VITE_ANTHROPIC_KEY
    if (!key || key === 'placeholder') {
      setErr('The assistant is unavailable right now.')
      setAiBusy(false)
      return
    }

    const transcript = history.slice(-14).map(m => (m.sender_name || 'Someone') + ': ' + m.content).join('\n')
    const when = hangout.datetime ? new Date(hangout.datetime).toLocaleString('en-AU', { weekday: 'long', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'not set yet'

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system: 'You are Outly AI, helping a group of friends in Western Sydney decide on a hangout. You have been invited into their group chat.\n' +
            'STYLE RULES (strict):\n' +
            '- PLAIN TEXT ONLY. No markdown, no asterisks, no headings, no bullet symbols.\n' +
            '- Under 100 words. Speak to the whole group, not one person.\n' +
            '- End with one short question that helps them lock the plan in.\n' +
            'HANGOUT: ' + hangout.name + '. Place: ' + (hangout.place || 'not chosen yet') + '. When: ' + when + '. Going: ' + (invited.length ? invited.join(', ') + ' and ' + myName : myName) + '.\n' +
            'ORGANISER PROFILE: budget ' + (profile?.budget ?? 'unknown') + ' per person, tastes ' + (profile?.food_preferences?.join(', ') || 'unknown') + '. Allergies and dietary needs: ' + (profile?.allergies?.length ? profile.allergies.join(', ') : 'none listed') + '. NEVER suggest anything that conflicts with these.\n' +
            (nearbyCtx
              ? 'REAL VENUES NEAR THE GROUP RIGHT NOW (live, with distances):\n' + nearbyCtx + '\nRecommend 2 or 3 specific venues from this list with their distances and a short reason each. Do not invent venues.'
              : 'You have no live venue data, so suggest types of places and point them to the Dine and Discover tabs.'),
          messages: [{ role: 'user', content: 'Here is the group chat so far:\n' + (transcript || '(no messages yet)') + '\n\n' + (question ? 'They just asked: ' + question : 'Help this group decide where to go.') }],
        }),
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text
        ?? (data.error?.message ? 'Assistant unavailable: ' + data.error.message : 'The assistant could not answer, try again.')
      const { data: saved, error } = await supabase.from('messages').insert({
        hangout_id: hangout.id, user_id: null, sender_name: 'Outly AI', content: reply,
      }).select().single()
      if (error) setErr(error.message)
      else if (saved) setMsgs(m => m.some(x => x.id === saved.id) ? m : [...m, saved])
    } catch (e) {
      setErr('Network problem reaching the assistant, try again.')
    } finally {
      setAiBusy(false)
    }
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading, aiBusy])

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setSending(true)
    setErr('')
    const { data, error } = await supabase.from('messages').insert({
      hangout_id: hangout.id,
      user_id: user.id,
      sender_name: myName,
      content: text,
    }).select().single()
    if (error) {
      setErr(error.message)
      setInput(text)
    } else if (data) {
      setMsgs(m => m.some(x => x.id === data.id) ? m : [...m, data])
    }
    setSending(false)
  }

  const invited = hangout.invited_names ?? []
  const when = hangout.datetime ? new Date(hangout.datetime) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#111', borderBottom: '0.5px solid #2a2a2a', flexShrink: 0 }}>
        <button className="ovback" onClick={onBack}><i className="ti ti-arrow-left" style={{ fontSize: 18, color: '#fff' }} /></button>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {hangout.type === 'Cinema' ? '🎬' : hangout.type === 'Outdoors' ? '🌿' : hangout.type === 'Activity' ? '🎮' : '🍔'}
        </div>
        <div style={{ flex: 1, marginLeft: 6, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hangout.name}</div>
          <div style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {invited.length ? invited.join(', ') + ' and you' : 'Just you so far'}
          </div>
        </div>
        <button className="ovback" onClick={() => setShowCal(true)}><i className="ti ti-calendar" style={{ fontSize: 18, color: '#FF6B35' }} /></button>
      </div>

      <div className="msgs">
        {/* Hangout summary card */}
        <div style={{ background: '#161616', border: '1px solid rgba(255,107,53,0.25)', borderRadius: 14, padding: 14, margin: '4px auto 10px', maxWidth: 300 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{hangout.name}</div>
          {hangout.place && <div style={{ fontSize: 12, color: '#aaa', marginBottom: 3 }}><i className="ti ti-map-pin" style={{ fontSize: 12, color: '#FF6B35' }} /> {hangout.place}</div>}
          {when && <div style={{ fontSize: 12, color: '#aaa' }}><i className="ti ti-clock" style={{ fontSize: 12, color: '#FF6B35' }} /> {when.toLocaleString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</div>}
          {invited.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {invited.map((n, i) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 50, padding: '4px 9px' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: PAL[i % PAL.length], fontSize: 8, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(n)}</div>
                  <span style={{ fontSize: 11, color: '#999' }}>{n}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && <div style={{ textAlign: 'center', fontSize: 12, color: '#555' }}>Loading messages...</div>}
        {!loading && msgs.length === 0 && (
          <div style={{ textAlign: 'center', fontSize: 12.5, color: '#555', lineHeight: 1.6, padding: '10px 24px' }}>
            No messages yet. Say something to get the plan moving, or tap the sparkle to bring Outly AI in and have it suggest real places near you.
          </div>
        )}

        {msgs.map(m => {
          const isAI = !m.user_id && m.sender_name === 'Outly AI'
          const mine = m.user_id === user.id
          return (
            <div key={m.id}>
              {isAI && <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: '#FF6B35', margin: '6px 0 3px 40px' }}>OUTLY AI</div>}
              <div className={mine ? 'mrow me' : 'mrow'}>
                {!mine && (
                  isAI
                    ? <div className="oa-wrap" style={{ width: 28, height: 28, flexShrink: 0 }}><span className="oa-text" style={{ fontSize: 9 }}>OA</span></div>
                    : <div style={{ width: 28, height: 28, borderRadius: '50%', background: PAL[(m.sender_name?.length ?? 0) % PAL.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {initials(m.sender_name || '?')}
                      </div>
                )}
                <div className={mine ? 'bub me' : 'bub them'} style={isAI ? { border: '1px solid rgba(255,107,53,0.35)' } : undefined}>{m.content}</div>
              </div>
            </div>
          )
        })}
        {aiBusy && (
          <div className="mrow">
            <div className="oa-wrap" style={{ width: 28, height: 28, flexShrink: 0 }}><span className="oa-text" style={{ fontSize: 9 }}>OA</span></div>
            <div className="bub them" style={{ color: '#666' }}>Outly AI is thinking...</div>
          </div>
        )}
        {err && <div style={{ textAlign: 'center', fontSize: 12, color: '#e07050', padding: '6px 20px' }}>{err}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="ibar">
        <input
          className="iinput"
          placeholder={`Message ${hangout.name}...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="iai" onClick={askAI} disabled={aiBusy} title="Ask Outly AI to help the group decide">
          <i className="ti ti-sparkles" />
        </button>
        <button className="isend" onClick={send} disabled={sending}><i className="ti ti-send" /></button>
      </div>

      {showCal && <CalendarOverlay hangout={hangout} onClose={() => setShowCal(false)} />}
    </div>
  )
}
