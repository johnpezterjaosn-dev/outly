import { useState } from 'react'

const USERS = [
  { i: 'NP', c: '#e67e22', name: 'Nathan P', un: '@nathanp', mutual: 4 },
  { i: 'AL', c: '#3498db', name: 'Amy Liu', un: '@amyliu', mutual: 2 },
  { i: 'JB', c: '#e91e63', name: 'Jake B', un: '@jakeb', mutual: 1 },
]

export default function AddFriendOverlay({ onClose }) {
  const [added, setAdded] = useState([])

  return (
    <div className="overlay">
      <div className="ovhead">
        <button className="ovback" onClick={onClose}><i className="ti ti-arrow-left" style={{ fontSize: 18, color: '#fff' }} /></button>
        <div className="ovtitle">Add Friends</div>
      </div>
      <div className="ovscroll">
        <div style={{ position: 'relative', marginTop: 16, marginBottom: 4 }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#555' }} />
          <input className="finput" style={{ paddingLeft: 42 }} placeholder="Search by name or @username" />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#555', padding: '14px 0 8px' }}>On Outly</div>
        {USERS.map(u => (
          <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '0.5px solid #1e1e1e' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: u.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{u.i}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{u.name}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{u.un} · {u.mutual} mutual</div>
            </div>
            {added.includes(u.name)
              ? <button style={{ background: 'transparent', color: '#1db954', border: '1px solid #1db954', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Added ✓</button>
              : <button onClick={() => setAdded(a => [...a, u.name])} style={{ background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Add</button>
            }
          </div>
        ))}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#555', padding: '14px 0 8px' }}>Invite from contacts</div>
        {[
          { icon: 'ti-address-book', title: 'Invite from Contacts', sub: 'See which contacts you can invite' },
          { icon: 'ti-link', title: 'Share invite link', sub: 'outly.app/invite/you · tap to copy' },
        ].map(item => (
          <div key={item.title} onClick={() => alert('Coming soon!')} style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 10 }}>
            <i className={`ti ${item.icon}`} style={{ fontSize: 20, color: '#FF6B35', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{item.sub}</div>
            </div>
            <i className="ti ti-chevron-right" style={{ fontSize: 16, color: '#555' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
