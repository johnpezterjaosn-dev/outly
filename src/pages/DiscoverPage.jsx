const SECTIONS = [
  { label: 'Scenic', icon: 'ti-mountain', type: 'cards', items: [
    { name: 'Bondi Headland', meta: 'Coastal walk · 3.2km', e: '🌅', bg: 'linear-gradient(135deg,#0f2027,#1a3a4a)', bc: '#5b8dee', badge: 'Scenic' },
    { name: 'Blue Mountains', meta: 'Lookout · 78km', e: '🌿', bg: 'linear-gradient(135deg,#1a2a1a,#1f3d2a)', bc: '#5b8dee', badge: 'Scenic' },
    { name: 'Sydney Harbour', meta: 'Waterfront · 5.1km', e: '🌃', bg: 'linear-gradient(135deg,#0d1b2a,#162840)', bc: '#5b8dee', badge: 'Scenic' },
  ]},
  { label: 'Free to visit', icon: 'ti-coin-off', type: 'list', items: [
    { name: 'Parramatta Park', sub: 'Heritage park · Open now', dist: '1.2km', tag: 'free', e: '🏖️' },
    { name: 'Art Gallery NSW', sub: 'Gallery · Open now', dist: '4.8km', tag: 'free', e: '🎨' },
    { name: 'Museum of Sydney', sub: 'Museum · Closes 5pm', dist: '6.1km', tag: 'free', e: '🏛️' },
  ]},
  { label: 'Parks', icon: 'ti-trees', type: 'cards', items: [
    { name: 'Centennial Park', meta: 'Parklands · 4.4km', e: '🌳', bg: 'linear-gradient(135deg,#1a2e1a,#223d22)', bc: '#3aad6e', badge: 'Park' },
    { name: 'Hyde Park', meta: 'City park · 5.6km', e: '🌲', bg: 'linear-gradient(135deg,#162216,#1e321e)', bc: '#3aad6e', badge: 'Park' },
    { name: 'Bicentennial Park', meta: 'Wetlands · 2.1km', e: '🌾', bg: 'linear-gradient(135deg,#1b2e1b,#243824)', bc: '#3aad6e', badge: 'Park' },
  ]},
  { label: 'Pricey but worth it', icon: 'ti-diamond', type: 'list', items: [
    { name: 'Luna Park', sub: 'Theme park · Open now', dist: '3.9km', tag: 'pricey', pricetag: '$$$$', e: '🎡' },
    { name: 'Taronga Zoo', sub: 'Wildlife · Closes 5pm', dist: '5.2km', tag: 'pricey', pricetag: '$$$', e: '🦘' },
    { name: 'Wake Park Sydney', sub: 'Watersports · Open now', dist: '8.4km', tag: 'pricey', pricetag: '$$$', e: '🏄' },
  ]},
  { label: 'Arcades', icon: 'ti-device-gamepad-2', type: 'cards', items: [
    { name: 'Timezone Sydney', meta: 'Arcade · Open now', e: '🕹️', bg: 'linear-gradient(135deg,#1a0a2e,#2d1260)', bc: '#9b59b6', badge: 'Arcade' },
    { name: 'Strike Bowling', meta: 'Bowling + arcade · 3km', e: '👾', bg: 'linear-gradient(135deg,#200a2e,#3a1255)', bc: '#9b59b6', badge: 'Arcade' },
    { name: 'Archie Brothers', meta: 'Retro arcade · 6km', e: '🎮', bg: 'linear-gradient(135deg,#180a2a,#2a1050)', bc: '#9b59b6', badge: 'Arcade' },
  ]},
  { label: 'Cinemas', icon: 'ti-movie', type: 'list', items: [
    { name: 'Event Cinemas', sub: 'Parramatta', dist: '0.8km', rating: '4.3', e: '🎬' },
    { name: 'Hoyts Penrith', sub: 'Penrith', dist: '4.2km', rating: '4.5', e: '🎥' },
    { name: 'Reading Cinemas', sub: 'Auburn', dist: '6.7km', rating: '4.1', e: '🍿' },
  ]},
]

export default function DiscoverPage() {
  return (
    <div>
      {SECTIONS.map(s => (
        <div key={s.label}>
          <div className="slabel"><i className={`ti ${s.icon}`} />{s.label}</div>
          {s.type === 'cards' ? (
            <div className="hscroll">
              {s.items.map(item => (
                <div key={item.name} className="fcard" style={{ background: item.bg }}>
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>{item.e}</div>
                  <div className="fcard-badge" style={{ background: item.bc }}>{item.badge}</div>
                  <div className="fcard-over">
                    <div className="fcard-name">{item.name}</div>
                    <div className="fcard-meta">{item.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {s.items.map(item => (
                <div key={item.name} className="lrow">
                  <div className="lthumb">{item.e}</div>
                  <div className="linfo">
                    <div className="lname">{item.name}</div>
                    <div className="lsub">{item.sub}</div>
                  </div>
                  <div className="lright">
                    <div className="ldist">{item.dist}</div>
                    {item.rating && <div className="lrating">⭐ {item.rating}</div>}
                    {item.tag === 'free' && <span className="tag tag-free" style={{ display: 'block', marginTop: 4 }}>Free</span>}
                    {item.tag === 'pricey' && <span className="tag tag-pricey" style={{ display: 'block', marginTop: 4 }}>{item.pricetag}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
