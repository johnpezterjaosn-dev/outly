import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getSettings } from '../lib/settings'
import AIChatView from '../components/AIChatView'
import GroupChatView from '../components/GroupChatView'
import CreateHangoutOverlay from '../components/CreateHangoutOverlay'
import AddFriendOverlay from '../components/AddFriendOverlay'

// Sample contacts. Outly has no public user base yet, so these stand in for the
// friends a user would invite. They are stored on the hangout as invited names.
const FRIENDS = [
  { i: 'KL', c: '#5b8dee', n: 'Kyle', online: true },
  { i: 'SM', c: '#e74c3c', n: 'Sarah', online: true },
  { i: 'MR', c: '#3aad6e', n: 'Marcus', online: false },
  { i: 'ZA', c: '#c9a227', n: 'Zara', online: true },
]

function OA({ s = 50 }) {
  return (
    <div className="oa-wrap" style={{ width: s, height: s }}>
      <span className="oa-text" style={{ fontSize: s * 0.3 }}>OA</span>
    </div>
  )
}

export { OA }

function ago(iso) {
  if (!iso) return ''
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return mins + 'm'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h'
  return Math.floor(hrs / 24) + 'd'
}

export default function DiscussPage() {
  const { user } = useAuth()
  const [active, setActive] = useState(null)     // 'ai' or a hangout object
  const [showCreate, setShowCreate] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [hangouts, setHangouts] = useState([])
  const [loading, setLoading] = useState(true)
  const settings = getSettings(user?.id)

  async function loadHangouts() {
    const { data } = await supabase
      .from('hangouts')
      .select('*')
      .order('created_at', { ascending: false })
    setHangouts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadHangouts() }, [])

  if (active === 'ai') return <AIChatView onBack={() => setActive(null)} />
  if (active && typeof active === 'object') {
    return <GroupChatView hangout={active} onBack={() => { setActive(null); loadHangouts() }} />
  }

  return (
    <div className="listfill">
      {/* Create hangout */}
      <div onClick={() => setShowCreate(true)} style={{ margin: '14px 20px 6px', background: '#FF6B35', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <i className="ti ti-calendar-plus" style={{ fontSize: 22, color: '#fff' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Create a Hangout</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>Pick a place, invite your crew</div>
        </div>
        <i className="ti ti-chevron-right" style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
      </div>

      {/* Contacts */}
      <div style={{ display: 'flex', gap: 14, padding: '10px 20px 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div onClick={() => setShowAdd(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1e1e1e', border: '1.5px dashed #444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#555' }}>+</div>
          <span style={{ fontSize: 10, color: '#666' }}>Add</span>
        </div>
        {FRIENDS.map(f => (
          <div key={f.n} onClick={() => setShowCreate(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: f.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', position: 'relative' }}>
              {f.i}
              {f.online && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1db954', border: '2px solid #111', position: 'absolute', bottom: 1, right: 1 }} />}
            </div>
            <span style={{ fontSize: 10, color: '#666' }}>{f.n}</span>
          </div>
        ))}
      </div>

      <div className="slabel">Messages</div>

      {/* Outly AI thread */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer' }} onClick={() => setActive('ai')}>
        <OA s={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Outly AI</span>
            <span style={{ fontSize: 11, color: '#555' }}>now</span>
          </div>
          <div style={{ fontSize: 13, color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Ask for places near you, it knows your allergies
          </div>
        </div>
      </div>

      {/* Real hangout chats */}
      {loading && <div style={{ padding: '10px 20px', fontSize: 12.5, color: '#555' }}>Loading your hangouts...</div>}

      {!loading && hangouts.length === 0 && (
        <div style={{ padding: '6px 20px 20px', fontSize: 12.5, color: '#555', lineHeight: 1.6 }}>
          No hangouts yet. Create one above, invite a few people, and it becomes a group chat you can plan in.
        </div>
      )}

      {hangouts.map(h => (
        <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer' }} onClick={() => setActive(h)}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {h.type === 'Cinema' ? '🎬' : h.type === 'Outdoors' ? '🌿' : h.type === 'Activity' ? '🎮' : '🍔'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</span>
              <span style={{ fontSize: 11, color: '#555', flexShrink: 0, marginLeft: 8 }}>{ago(h.created_at)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {h.place ? h.place : 'Tap to plan'}
              {h.invited_names?.length ? ' · ' + h.invited_names.join(', ') : ''}
            </div>
          </div>
        </div>
      ))}

      {showCreate && (
        <CreateHangoutOverlay
          onClose={() => setShowCreate(false)}
          friends={FRIENDS}
          onCreated={h => { setHangouts(list => [h, ...list]); setActive(h) }}
        />
      )}
      {showAdd && <AddFriendOverlay onClose={() => setShowAdd(false)} />}
    </div>
  )
}
