import { useState } from 'react'
import AIChatView from '../components/AIChatView'
import GroupChatView from '../components/GroupChatView'
import CreateHangoutOverlay from '../components/CreateHangoutOverlay'
import AddFriendOverlay from '../components/AddFriendOverlay'

const FRIENDS = [
  { i: 'KL', c: '#5b8dee', n: 'Kyle', online: true },
  { i: 'SM', c: '#e74c3c', n: 'Sarah', online: true },
  { i: 'MR', c: '#3aad6e', n: 'Marcus', online: false },
  { i: 'ZA', c: '#c9a227', n: 'Zara', online: true },
]

const CHATS = [
  { id: 'ai', ai: true, name: 'Outly AI', preview: 'I found 3 great spots for Saturday 👀', time: 'now', unread: 1 },
  { id: 'group', name: 'Weekend Squad', preview: '📍 Vote open · 3 options', time: '2m', unread: 3, e: '🏀', bg: '#FF6B35', hangout: true },
  { id: 'kyle', name: 'Kyle L', preview: 'bro you free Saturday??', time: '15m', i: 'KL', c: '#5b8dee' },
  { id: 'sarah', name: 'Sarah M', preview: 'haha yeah lets do it', time: '1h', i: 'SM', c: '#e74c3c' },
]

function OA({ s = 50 }) {
  return (
    <div className="oa-wrap" style={{ width: s, height: s }}>
      <span className="oa-text" style={{ fontSize: s * 0.3 }}>OA</span>
    </div>
  )
}

export { OA }

export default function DiscussPage() {
  const [active, setActive] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  if (active === 'ai') return <AIChatView onBack={() => setActive(null)} />
  if (active === 'group') return <GroupChatView onBack={() => setActive(null)} />

  return (
    <div>
      {/* Create hangout */}
      <div onClick={() => setShowCreate(true)} style={{ margin: '14px 20px 6px', background: '#FF6B35', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <i className="ti ti-calendar-plus" style={{ fontSize: 22, color: '#fff' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Create a Hangout</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>Pick a place, invite your crew</div>
        </div>
        <i className="ti ti-chevron-right" style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
      </div>

      {/* Friends row */}
      <div style={{ display: 'flex', gap: 14, padding: '10px 20px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div onClick={() => setShowAdd(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1e1e1e', border: '1.5px dashed #444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#555' }}>+</div>
          <span style={{ fontSize: 10, color: '#666' }}>Add</span>
        </div>
        {FRIENDS.map(f => (
          <div key={f.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: f.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', position: 'relative' }}>
              {f.i}
              {f.online && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1db954', border: '2px solid #111', position: 'absolute', bottom: 1, right: 1 }} />}
            </div>
            <span style={{ fontSize: 10, color: '#666' }}>{f.n}</span>
          </div>
        ))}
      </div>

      <div className="slabel">Messages</div>

      {CHATS.map(chat => (
        <div key={chat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer' }} onClick={() => setActive(chat.id)}>
          {chat.ai
            ? <OA s={50} />
            : chat.e
              ? <div style={{ width: 50, height: 50, borderRadius: '50%', background: chat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{chat.e}</div>
              : <div style={{ width: 50, height: 50, borderRadius: '50%', background: chat.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{chat.i}</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{chat.name}</span>
              <span style={{ fontSize: 11, color: '#555' }}>{chat.time}</span>
            </div>
            <div style={{ fontSize: 13, color: chat.unread ? '#aaa' : '#666', fontWeight: chat.unread ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {chat.hangout
                ? <span style={{ background: 'rgba(255,107,53,0.15)', borderRadius: 20, padding: '2px 8px', fontSize: 11, color: '#FF6B35', fontWeight: 600 }}>{chat.preview}</span>
                : chat.preview
              }
            </div>
          </div>
          {chat.unread > 0 && (
            <div style={{ minWidth: 18, height: 18, borderRadius: 9, background: '#FF6B35', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{chat.unread}</div>
          )}
        </div>
      ))}

      {showCreate && <CreateHangoutOverlay onClose={() => setShowCreate(false)} friends={FRIENDS} />}
      {showAdd && <AddFriendOverlay onClose={() => setShowAdd(false)} />}
    </div>
  )
}
