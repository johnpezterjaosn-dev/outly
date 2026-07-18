import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { searchNearby, searchByText, photoUrl, hasPlacesKey } from '../lib/places'
import PlaceDetailOverlay from '../components/PlaceDetailOverlay'

// Placeholder data — shown when no Google Places key or no coords yet
const FALLBACK_FEATURED = [
  { name: 'Nobu Sydney', type: 'Japanese', dist: '12km', e: '🍣', badge: 'Trending', bg: 'linear-gradient(135deg,#1a1a2e,#2d1b4e)' },
  { name: "Gigi's Pizzeria", type: 'Italian', dist: '8km', e: '🍕', badge: 'Hot pick', bg: 'linear-gradient(135deg,#1a2e1a,#1b3d2a)' },
  { name: 'Burgerlords', type: 'American', dist: '15km', e: '🍔', badge: 'Popular', bg: 'linear-gradient(135deg,#2e1a1a,#3d1b1b)' },
]
const FALLBACK_NEARBY = [
  { name: 'Pho House', type: 'Vietnamese', openNow: true, dist: '0.3km', rating: '4.7', e: '🍜' },
  { name: "Zara's Kitchen", type: 'Mediterranean', openNow: true, dist: '0.6km', rating: '4.5', e: '🧆' },
  { name: 'Elixir Café', type: 'Café', openNow: true, dist: '0.8km', rating: '4.8', e: '☕' },
  { name: 'Bento Bros', type: 'Japanese', openNow: false, dist: '1.1km', rating: '4.4', e: '🍱' },
  { name: 'Taco Loco', type: 'Mexican', openNow: true, dist: '1.4km', rating: '4.3', e: '🌮' },
]

export default function DinePage() {
  const { profile } = useAuth()
  const [featured, setFeatured] = useState(null)
  const [nearby, setNearby] = useState(null)
  const [selected, setSelected] = useState(null)
  const live = hasPlacesKey() && profile?.lat && profile?.lng

  useEffect(() => {
    if (!live) return
    const { lat, lng } = profile
    // Featured: bias toward the user's top cuisine preference if they have one
    const topPref = profile.food_preferences?.[0]
    const featuredCall = topPref
      ? searchByText({ query: `${topPref} restaurant`, lat, lng, max: 6 })
      : searchNearby({ lat, lng, types: ['restaurant'], radius: 5000, max: 6 })
    featuredCall.then(r => r && setFeatured(r))
    searchNearby({ lat, lng, types: ['restaurant', 'cafe'], radius: 2000, max: 10 }).then(r => r && setNearby(r))
  }, [live, profile?.lat, profile?.lng])

  const feat = live ? featured : FALLBACK_FEATURED
  const near = live ? nearby : FALLBACK_NEARBY

  return (
    <div>
      {live && !profile?.location_live && profile?.postcode && (
        <div style={{ margin: '10px 16px 0', fontSize: 11, color: '#777', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-mailbox" style={{ fontSize: 13 }} />
          Showing your postcode {profile.postcode} area — allow location for results near you right now
        </div>
      )}
      {live && profile?.location_live && (
        <div style={{ margin: '10px 16px 0', fontSize: 11, color: '#3aad6e', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="ti ti-current-location" style={{ fontSize: 13 }} />
          Live location — results near you now
        </div>
      )}
      {!live && (
        <div style={{ margin: '10px 16px 0', background: '#1a1a1a', border: '0.5px dashed #2a2a2a', borderRadius: 12, padding: '10px 12px', fontSize: 11.5, color: '#666', lineHeight: 1.4 }}>
          Showing sample data — add a Google Places key {!profile?.lat && '+ location'} for live results near you.
        </div>
      )}

      <div className="slabel"><i className="ti ti-sparkles" />Featured for you</div>
      <div className="hscroll">
        {!feat && [1,2,3].map(i => <div key={i} className="fcard skel" />)}
        {(feat ?? []).map(p => (
          <div key={p.id ?? p.name} className="fcard" onClick={() => setSelected(p)}
            style={{ background: p.bg ?? '#1a1a1a', cursor: 'pointer', overflow: 'hidden' }}>
            {p.photo && hasPlacesKey() ? (
              <img src={photoUrl(p.photo, 400)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>{p.e ?? '🍽️'}</div>
            )}
            <div className="fcard-badge">{p.badge ?? (p.rating ? `⭐ ${p.rating}` : 'Nearby')}</div>
            <div className="fcard-over">
              <div className="fcard-name">{p.name}</div>
              <div className="fcard-meta">{p.type}{p.dist ? ` · ${p.dist} away` : ''}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="slabel" style={{ marginTop: 8 }}><i className="ti ti-map-pin" />Nearby you</div>
      {!near && [1,2,3,4,5].map(i => (
        <div key={i} className="lrow">
          <div className="lthumb skel" />
          <div className="linfo">
            <div className="skel" style={{ height: 14, width: '60%', marginBottom: 8 }} />
            <div className="skel" style={{ height: 10, width: '40%' }} />
          </div>
        </div>
      ))}
      {(near ?? []).map(n => (
        <div key={n.id ?? n.name} className="lrow" onClick={() => setSelected(n)} style={{ cursor: 'pointer' }}>
          <div className="lthumb" style={{ overflow: 'hidden' }}>
            {n.photo && hasPlacesKey()
              ? <img src={photoUrl(n.photo, 120)} alt={n.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (n.e ?? '🍽️')}
          </div>
          <div className="linfo">
            <div className="lname">{n.name}</div>
            <div className="lsub">{n.type}{n.openNow !== undefined ? ` · ${n.openNow ? 'Open now' : 'Closed'}` : ''}</div>
          </div>
          <div className="lright">
            {n.dist && <div className="ldist">{n.dist}</div>}
            {n.rating && <div className="lrating">⭐ {n.rating}</div>}
          </div>
        </div>
      ))}

      {selected && <PlaceDetailOverlay place={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
