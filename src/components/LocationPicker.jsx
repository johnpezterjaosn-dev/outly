import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { geocodePostcode, searchByText, hasPlacesKey } from '../lib/places'
import { getSettings, saveSettings } from '../lib/settings'

// Common Western Sydney areas, so most users never have to type
const QUICK = ['Blacktown', 'Parramatta', 'Penrith', 'Liverpool', 'Bankstown', 'Castle Hill', 'Mount Druitt', 'Auburn']

export default function LocationPicker({ onClose }) {
  const { user, profile, setLocation } = useAuth()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const s = getSettings(user?.id)

  async function apply(query) {
    const q = (query ?? text).trim()
    if (!q || busy) return
    setBusy(true); setErr('')
    try {
      if (!hasPlacesKey()) throw new Error('Location search is unavailable right now.')
      let coords = null
      let label = q
      if (/^\d{4}$/.test(q)) {
        coords = await geocodePostcode(q)
      } else {
        const results = await searchByText({ query: q + ', NSW Australia', max: 1 })
        const hit = results?.[0]
        if (hit) {
          coords = { lat: hit.lat, lng: hit.lng }
          label = hit.name || q
        }
      }
      if (!coords?.lat) throw new Error('Could not find that place. Try a postcode such as 2148, or a suburb such as Blacktown.')
      saveSettings(user.id, { areaLabel: label, useLiveLocation: false })
      await setLocation({ lat: coords.lat, lng: coords.lng, postcode: /^\d{4}$/.test(q) ? q : profile?.postcode })
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function useLive() {
    if (!navigator.geolocation) { setErr('This device cannot share its location.'); return }
    setBusy(true); setErr('')
    navigator.geolocation.getCurrentPosition(
      async pos => {
        saveSettings(user.id, { areaLabel: '', useLiveLocation: true })
        await setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setBusy(false); onClose()
      },
      () => { setErr('Location permission was declined, so pick an area below instead.'); setBusy(false) },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="overlay">
      <div className="ovhead">
        <button className="ovback" onClick={onClose}><i className="ti ti-arrow-left" style={{ fontSize: 18, color: '#fff' }} /></button>
        <div className="ovtitle">Change area</div>
      </div>
      <div className="ovscroll">
        <p style={{ fontSize: 13.5, color: '#888', margin: '16px 0', lineHeight: 1.55 }}>
          Outly covers Western Sydney. Search results, distances and the assistant all work from the area set here.
        </p>

        <div onClick={useLive} style={{ background: s.useLiveLocation ? 'rgba(255,107,53,0.1)' : '#1a1a1a', border: '1.5px solid ' + (s.useLiveLocation ? '#FF6B35' : '#2a2a2a'), borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <i className="ti ti-current-location" style={{ fontSize: 20, color: '#FF6B35' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Use my live location</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Results follow you as you move</div>
          </div>
          {s.useLiveLocation && <i className="ti ti-check" style={{ fontSize: 18, color: '#FF6B35' }} />}
        </div>

        <div className="flabel" style={{ marginTop: 22 }}>Or set an area</div>
        <input
          className="finput"
          placeholder="Suburb or postcode, e.g. Blacktown or 2148"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && apply()}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {QUICK.map(q => (
            <div key={q} onClick={() => apply(q)} style={{ background: s.areaLabel === q ? 'rgba(255,107,53,0.12)' : '#1a1a1a', border: '1px solid ' + (s.areaLabel === q ? '#FF6B35' : '#2a2a2a'), borderRadius: 50, padding: '8px 14px', fontSize: 13, color: s.areaLabel === q ? '#FF6B35' : '#aaa', cursor: 'pointer' }}>{q}</div>
          ))}
        </div>

        {err && <div className="err" style={{ marginTop: 14 }}>{err}</div>}

        <button className="btn btn-o" style={{ marginTop: 24 }} disabled={busy} onClick={() => apply()}>
          {busy ? 'Setting area...' : 'Set area'}
        </button>
      </div>
    </div>
  )
}
