import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import CalendarOverlay from './CalendarOverlay'

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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

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
            No messages yet. Say something to get the plan moving. Messages are saved and appear live for everyone in this hangout.
          </div>
        )}

        {msgs.map(m => {
          const mine = m.user_id === user.id
          return (
            <div key={m.id} className={mine ? 'mrow me' : 'mrow'}>
              {!mine && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: PAL[(m.sender_name?.length ?? 0) % PAL.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {initials(m.sender_name || '?')}
                </div>
              )}
              <div className={mine ? 'bub me' : 'bub them'}>{m.content}</div>
            </div>
          )
        })}
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
        <button className="isend" onClick={send} disabled={sending}><i className="ti ti-send" /></button>
      </div>

      {showCal && <CalendarOverlay hangout={hangout} onClose={() => setShowCal(false)} />}
    </div>
  )
}
