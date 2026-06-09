const FEATURED = [
  { name: 'Nobu Sydney', cuisine: 'Japanese', distance: '12km', e: '🍣', badge: 'Trending', bg: 'linear-gradient(135deg,#1a1a2e,#2d1b4e)' },
  { name: "Gigi's Pizzeria", cuisine: 'Italian', distance: '8km', e: '🍕', badge: 'Hot pick', bg: 'linear-gradient(135deg,#1a2e1a,#1b3d2a)' },
  { name: 'Burgerlords', cuisine: 'American', distance: '15km', e: '🍔', badge: 'Popular', bg: 'linear-gradient(135deg,#2e1a1a,#3d1b1b)' },
]

const NEARBY = [
  { name: 'Pho House', sub: 'Vietnamese · Open now', dist: '0.3km', rating: '4.7', e: '🍜' },
  { name: "Zara's Kitchen", sub: 'Mediterranean · Open now', dist: '0.6km', rating: '4.5', e: '🧆' },
  { name: 'Elixir Café', sub: 'Café · Open now', dist: '0.8km', rating: '4.8', e: '☕' },
  { name: 'Bento Bros', sub: 'Japanese · Closes 10pm', dist: '1.1km', rating: '4.4', e: '🍱' },
  { name: 'Taco Loco', sub: 'Mexican · Open now', dist: '1.4km', rating: '4.3', e: '🌮' },
]

export default function DinePage() {
  return (
    <div>
      <div className="slabel"><i className="ti ti-sparkles" />Featured for you</div>
      <div className="hscroll">
        {FEATURED.map(p => (
          <div key={p.name} className="fcard" style={{ background: p.bg }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>{p.e}</div>
            <div className="fcard-badge">{p.badge}</div>
            <div className="fcard-over">
              <div className="fcard-name">{p.name}</div>
              <div className="fcard-meta">{p.cuisine} · {p.distance} away</div>
            </div>
          </div>
        ))}
      </div>

      <div className="slabel" style={{ marginTop: 8 }}><i className="ti ti-map-pin" />Nearby you</div>
      {NEARBY.map(n => (
        <div key={n.name} className="lrow">
          <div className="lthumb">{n.e}</div>
          <div className="linfo">
            <div className="lname">{n.name}</div>
            <div className="lsub">{n.sub}</div>
          </div>
          <div className="lright">
            <div className="ldist">{n.dist}</div>
            <div className="lrating">⭐ {n.rating}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
