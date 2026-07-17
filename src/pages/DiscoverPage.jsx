import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { searchNearby, photoUrl, hasPlacesKey } from '../lib/places'
import PlaceDetailOverlay from '../components/PlaceDetailOverlay'

// Category config — each maps to real Google Places types when a key is present
const CATEGORIES = [
  { key: 'scenic', label: 'Scenic', icon: 'ti-mountain', type: 'cards', badge: 'Scenic', bc: '#5b8dee',
    types: ['tourist_attraction'], radius: 15000 },
  { key: 'free', label: 'Free to visit', icon: 'ti-coin-off', type: 'list', tag: 'free',
    types: ['park', 'art_gallery', 'museum'], radius: 8000 },
  { key: 'parks', label: 'Parks', icon: 'ti-trees', type: 'cards', badge: 'Park', bc: '#3aad6e',
    types: ['park'], radius: 6000 },
  { key: 'pricey', label: 'Pricey but worth it', icon: 'ti-diamond', type: 'list', tag: 'pricey',
    types: ['amusement_park', 'zoo', 'aquarium'], radius: 25000 },
  { key: 'arcades', label: 'Arcades', icon: 'ti-device-gamepad-2', type: 'cards', badge: 'Arcade', bc: '#9b59b6',
    types: ['amusement_center', 'bowling_alley'], radius: 12000 },
  { key: 'cinemas', label: 'Cinemas', icon: 'ti-movie', type: 'list',
    types: ['movie_theater'], radius: 10000 },
]

const FALLBACK = {
  scenic: [
    { name: 'Bondi Headland', type: 'Coastal walk', dist: '3.2km', e: '🌅', bg: 'linear-gradient(135deg,#0f2027,#1a3a4a)' },
    { name: 'Blue Mountains', type: 'Lookout', dist: '78km', e: '🌿', bg: 'linear-gradient(135deg,#1a2a1a,#1f3d2a)' },
    { name: 'Sydney Harbour', type: 'Waterfront', dist: '5.1km', e: '🌃', bg: 'linear-gradient(135deg,#0d1b2a,#162840)' },
  ],
  free: [
    { name: 'Parramatta Park', type: 'Heritage park', openNow: true, dist: '1.2km', e: '🏖️' },
    { name: 'Art Gallery NSW', type: 'Gallery', openNow: true, dist: '4.8km', e: '🎨' },
    { name: 'Museum of Sydney', type: 'Museum', openNow: false, dist: '6.1km', e: '🏛️' },
  ],
  parks: [
    { name: 'Centennial Park', type: 'Parklands', dist: '4.4km', e: '🌳', bg: 'linear-gradient(135deg,#1a2e1a,#223d22)' },
    { name: 'Hyde Park', type: 'City park', dist: '5.6km', e: '🌲', bg: 'linear-gradient(135deg,#162216,#1e321e)' },
    { name: 'Bicentennial Park', type: 'Wetlands', dist: '2.1km', e: '🌾', bg: 'linear-gradient(135deg,#1b2e1b,#243824)' },
  ],
  pricey: [
    { name: 'Luna Park', type: 'Theme park', openNow: true, dist: '3.9km', pricetag: '$$$$', e: '🎡' },
    { name: 'Taronga Zoo', type: 'Wildlife', openNow: false, dist: '5.2km', pricetag: '$$$', e: '🦘' },
    { name: 'Wake Park Sydney', type: 'Watersports', openNow: true, dist: '8.4km', pricetag: '$$$', e: '🏄' },
  ],
  arcades: [
    { name: 'Timezone Sydney', type: 'Arcade', dist: '2km', e: '🕹️', bg: 'linear-gradient(135deg,#1a0a2e,#2d1260)' },
    { name: 'Strike Bowling', type: 'Bowling + arcade', dist: '3km', e: '👾', bg: 'linear-gradient(135deg,#200a2e,#3a1255)' },
    { name: 'Archie Brothers', type: 'Retro arcade', dist: '6km', e: '🎮', bg: 'linear-gradient(135deg,#180a2a,#2a1050)' },
  ],
  cinemas: [
    { name: 'Event Cinemas', type: 'Parramatta', dist: '0.8km', rating: '4.3', e: '🎬' },
    { name: 'Hoyts Penrith', type: 'Penrith', dist: '4.2km', rating: '4.5', e: '🎥' },
    { name: 'Reading Cinemas', type: 'Auburn', dist: '6.7km', rating: '4.1', e: '🍿' },
  ],
}

export default function DiscoverPage() {
  const { profile } = useAuth()
  const [data, setData] = useState({})
  const [selected, setSelected] = useState(null)
  const live = hasPlacesKey() && profile?.lat && profile?.lng

  useEffect(() => {
    if (!live) return
    const { lat, lng } = profile
    CATEGORIES.forEach(c => {
      searchNearby({ lat, lng, types: c.types, radius: c.radius, max: 5 })
        .then(r => { if (r?.length) setData(d => ({ ...d, [c.key]: r })) })
    })
  }, [live, profile?.lat, profile?.lng])

  return (
    <div>
      {!live && (
        <div style={{ margin: '10px 16px 0', background: '#1a1a1a', border: '0.5px dashed #2a2a2a', borderRadius: 12, padding: '10px 12px', fontSize: 11.5, color: '#666', lineHeight: 1.4 }}>
          Showing sample data — add a Google Places key {!profile?.lat && '+ location'} for live results near you.
        </div>
      )}

      {CATEGORIES.map(c => {
        const items = data[c.key] ?? FALLBACK[c.key]
        return (
          <div key={c.key}>
            <div className="slabel"><i className={`ti ${c.icon}`} />{c.label}</div>
            {c.type === 'cards' ? (
              <div className="hscroll">
                {items.map(item => (
                  <div key={item.id ?? item.name} className="fcard" onClick={() => setSelected(item)}
                    style={{ background: item.bg ?? '#1a1a1a', cursor: 'pointer', overflow: 'hidden' }}>
                    {item.photo && hasPlacesKey() ? (
                      <img src={photoUrl(item.photo, 400)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>{item.e ?? '📍'}</div>
                    )}
                    <div className="fcard-badge" style={{ background: c.bc }}>{c.badge}</div>
                    <div className="fcard-over">
                      <div className="fcard-name">{item.name}</div>
                      <div className="fcard-meta">{item.type}{item.dist ? ` · ${item.dist}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {items.map(item => (
                  <div key={item.id ?? item.name} className="lrow" onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
                    <div className="lthumb" style={{ overflow: 'hidden' }}>
                      {item.photo && hasPlacesKey()
                        ? <img src={photoUrl(item.photo, 120)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (item.e ?? '📍')}
                    </div>
                    <div className="linfo">
                      <div className="lname">{item.name}</div>
                      <div className="lsub">{item.type}{item.openNow !== undefined ? ` · ${item.openNow ? 'Open now' : 'Closed'}` : ''}</div>
                    </div>
                    <div className="lright">
                      {item.dist && <div className="ldist">{item.dist}</div>}
                      {item.rating && <div className="lrating">⭐ {item.rating}</div>}
                      {c.tag === 'free' && <span className="tag tag-free" style={{ display: 'block', marginTop: 4 }}>Free</span>}
                      {c.tag === 'pricey' && <span className="tag tag-pricey" style={{ display: 'block', marginTop: 4 }}>{item.pricetag ?? '$$$'}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {selected && <PlaceDetailOverlay place={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
