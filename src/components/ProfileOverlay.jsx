import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSettings, saveSettings } from '../lib/settings'
import LocationPicker from './LocationPicker'

function Toggle({ on, onChange }) {
  return (
    <div className={on ? 'toggle on' : 'toggle'} onClick={e => { e.stopPropagation(); onChange(!on) }}>
      <div className="knob" />
    </div>
  )
}

const FOODS = [
  { e: '🍔', l: "McDonald's" }, { e: '🍗', l: 'KFC' }, { e: '🍕', l: "Domino's" },
  { e: '🌮', l: 'Taco Bell' }, { e: '🥪', l: 'Subway' }, { e: '🍣', l: 'Japanese' },
  { e: '🍜', l: 'Vietnamese' }, { e: '🥘', l: 'Chinese' }, { e: '🍛', l: 'Indian' },
  { e: '🥙', l: 'Lebanese' }, { e: '🍝', l: 'Italian' }, { e: '🌯', l: 'Mexican' },
  { e: '🥩', l: 'Steakhouse' }, { e: '🍱', l: 'Korean BBQ' }, { e: '🥗', l: 'Healthy' },
  { e: '☕', l: 'Café' }, { e: '🍦', l: 'Dessert' }, { e: '🍺', l: 'Bar & Grill' },
]
const ALLERGIES = [
  { e: '🥜', l: 'Nuts' }, { e: '🦐', l: 'Shellfish' }, { e: '🌾', l: 'Gluten' },
  { e: '🥛', l: 'Dairy' }, { e: '🥚', l: 'Egg' }, { e: '🫘', l: 'Soy' },
  { e: '🐟', l: 'Fish' }, { e: '🌱', l: 'Vegetarian' }, { e: '🥦', l: 'Vegan' },
  { e: '☪️', l: 'Halal' }, { e: '✡️', l: 'Kosher' }, { e: '✅', l: 'None' },
]
const BUDGETS = [
  { e: '🤑', range: '$5 – $10', label: 'Budget friendly', v: '5-10' },
  { e: '😋', range: '$11 – $20', label: 'Everyday eats', v: '11-20' },
  { e: '🍽️', range: '$20 – $50', label: 'Treat yourself', v: '20-50' },
  { e: '✨', range: 'Any budget', label: 'Show me everything', v: 'any' },
]

function SubOverlay({ title, onBack, onSave, children }) {
  return (
    <div className="overlay" style={{ zIndex: 60 }}>
      <div className="ovhead">
        <button className="ovback" onClick={onBack}><i className="ti ti-arrow-left" style={{ fontSize: 18, color: '#fff' }} /></button>
        <div className="ovtitle">{title}</div>
        <span className="ovsave" onClick={onSave}>Save</span>
      </div>
      <div className="ovscroll">{children}</div>
    </div>
  )
}

export default function ProfileOverlay({ onClose }) {
  const { profile, updateProfile, signOut } = useAuth()
  const [sub, setSub] = useState(null)
  const [openPanel, setOpenPanel] = useState(null)
  const [showArea, setShowArea] = useState(false)
  const [settings, setSettings] = useState(() => getSettings(profile?.id))
  function setOpt(patch) { setSettings(saveSettings(profile?.id, patch)) }
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    username: profile?.username ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
  })
  const [bud, setBud] = useState(profile?.budget ?? null)
  const [foodPrefs, setFoodPrefs] = useState(profile?.food_preferences ?? [])
  const [alg, setAlg] = useState(profile?.allergies ?? [])

  const initials = `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase() || '?'
  const budgetInfo = BUDGETS.find(b => b.v === profile?.budget)

  async function save(updates) {
    setSaving(true)
    try { await updateProfile(updates) } catch (e) { console.error(e) } finally { setSaving(false); setSub(null) }
  }

  function toggleFood(l) { setFoodPrefs(f => f.includes(l) ? f.filter(x => x !== l) : [...f, l]) }
  function toggleAlg(l) {
    if (l === 'None') return setAlg(a => a.includes('None') ? [] : ['None'])
    setAlg(a => a.includes(l) ? a.filter(x => x !== l) : [...a.filter(x => x !== 'None'), l])
  }

  if (sub === 'profile') return (
    <SubOverlay title="Edit Profile" onBack={() => setSub(null)} onSave={() => save(form)}>
      {[['first_name','First name'],['last_name','Last name'],['username','Username'],['email','Email'],['phone','Phone']].map(([k, label]) => (
        <div key={k} className="fwrap" style={{ marginTop: 16 }}>
          <div className="flabel">{label}</div>
          <input className="finput" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={k === 'phone' ? 'Add phone number' : ''} />
        </div>
      ))}
    </SubOverlay>
  )

  if (sub === 'budget') return (
    <SubOverlay title="Edit Budget" onBack={() => setSub(null)} onSave={() => save({ budget: bud })}>
      <p style={{ fontSize: 14, color: '#666', margin: '16px 0', lineHeight: 1.5 }}>Your budget helps us recommend places that suit your spending style.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {BUDGETS.map(b => (
          <div key={b.v} onClick={() => setBud(b.v)} style={{
            borderRadius: 16, padding: '16px 12px', cursor: 'pointer', textAlign: 'center',
            border: `1.5px solid ${bud === b.v ? '#FF6B35' : '#2a2a2a'}`,
            background: bud === b.v ? 'rgba(255,107,53,0.1)' : '#1a1a1a',
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{b.e}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: bud === b.v ? '#FF6B35' : '#fff' }}>{b.range}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{b.label}</div>
          </div>
        ))}
      </div>
    </SubOverlay>
  )

  if (sub === 'allergies') return (
    <SubOverlay title="Allergies & Dietary Needs" onBack={() => setSub(null)} onSave={() => save({ allergies: alg })}>
      <p style={{ fontSize: 14, color: '#666', margin: '16px 0', lineHeight: 1.5 }}>We filter suggestions around these — the AI will never suggest food that conflicts with them.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALLERGIES.map(a => (
          <div key={a.l} className={`chip ${alg.includes(a.l) ? 'on' : ''}`} onClick={() => toggleAlg(a.l)}>
            <span style={{ fontSize: 15 }}>{a.e}</span><span>{a.l}</span>
          </div>
        ))}
      </div>
    </SubOverlay>
  )

  if (sub === 'food') return (
    <SubOverlay title="Food Preferences" onBack={() => setSub(null)} onSave={() => save({ food_preferences: foodPrefs })}>
      <p style={{ fontSize: 14, color: '#666', margin: '16px 0', lineHeight: 1.5 }}>Tap to add or remove. We use these to personalise your feeds.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {FOODS.map(f => (
          <div key={f.l} className={`chip ${foodPrefs.includes(f.l) ? 'on' : ''}`} onClick={() => toggleFood(f.l)}>
            <span style={{ fontSize: 15 }}>{f.e}</span><span>{f.l}</span>
          </div>
        ))}
      </div>
    </SubOverlay>
  )

  return (
    <div className="overlay">
      <div className="ovhead">
        <button className="ovback" onClick={onClose}><i className="ti ti-arrow-left" style={{ fontSize: 18, color: '#fff' }} /></button>
        <div className="ovtitle">Profile</div>
        <span className="ovsave" onClick={onClose}>Done</span>
      </div>
      <div className="ovscroll">
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px 20px' }}>
          <div style={{ position: 'relative', marginBottom: 14, cursor: 'pointer' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#FF6B35,#f5a623)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', border: '3px solid #222' }}>{initials}</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: -0.3, marginBottom: 2 }}>{profile?.first_name} {profile?.last_name}</div>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>@{profile?.username}</div>
          <div style={{ display: 'flex', gap: 28, marginBottom: 16 }}>
            {[['—','Friends'],['—','Hangouts'],['—','Places']].map(([n,l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{n}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 1 }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setSub('profile')} style={{ background: '#1e1e1e', border: '0.5px solid #2a2a2a', borderRadius: 10, padding: '8px 24px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Edit Profile</button>
        </div>

        {/* Details */}
        <Row title="My Details" />
        <InfoCard items={[
          { icon: 'ti-mail', label: 'Email', val: profile?.email ?? 'Not set', onClick: () => setSub('profile') },
          { icon: 'ti-phone', label: 'Phone', val: profile?.phone ?? 'Not set', onClick: () => setSub('profile') },
        ]} />

        {/* Budget */}
        <Row title="Budget" action="Change" onAction={() => setSub('budget')} />
        <div style={{ margin: '0 20px', background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28 }}>{budgetInfo?.e ?? '💰'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{budgetInfo?.range ?? 'Not set'}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{budgetInfo?.label ?? 'Tap Change to set your budget'}</div>
          </div>
          <span style={{ fontSize: 12, color: '#FF6B35', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSub('budget')}>Edit →</span>
        </div>

        {/* Food */}
        <Row title="Food & Vibe Preferences" action="Edit" onAction={() => setSub('food')} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 20px' }}>
          {(profile?.food_preferences ?? []).length > 0
            ? (profile.food_preferences).map(f => {
                const info = FOODS.find(x => x.l === f)
                return (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 50, padding: '7px 12px' }}>
                    <span style={{ fontSize: 15 }}>{info?.e ?? '🍽️'}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#aaa' }}>{f}</span>
                  </div>
                )
              })
            : <span style={{ fontSize: 13, color: '#555' }}>No preferences — <span style={{ color: '#FF6B35', cursor: 'pointer' }} onClick={() => setSub('food')}>add some</span></span>
          }
        </div>

        {/* Allergies */}
        <Row title="Allergies & Dietary Needs" action="Edit" onAction={() => setSub('allergies')} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 20px' }}>
          {(profile?.allergies ?? []).length > 0
            ? (profile.allergies).map(a => {
                const info = ALLERGIES.find(x => x.l === a)
                return (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 50, padding: '7px 12px' }}>
                    <span style={{ fontSize: 15 }}>{info?.e ?? '⚠️'}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#aaa' }}>{a}</span>
                  </div>
                )
              })
            : <span style={{ fontSize: 13, color: '#555' }}>None set — <span style={{ color: '#FF6B35', cursor: 'pointer' }} onClick={() => setSub('allergies')}>add yours</span></span>
          }
        </div>

        {/* Settings */}
        <Row title="Settings" />
        <div style={{ margin: '0 20px', background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 14, overflow: 'hidden' }}>

          {/* Notifications */}
          <div className="setrow" onClick={() => setOpenPanel(openPanel === 'notif' ? null : 'notif')} style={{ borderBottom: '0.5px solid #1e1e1e' }}>
            <i className="ti ti-bell" style={{ fontSize: 18, color: '#888', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#ccc' }}>Notifications</span>
            <i className={openPanel === 'notif' ? 'ti ti-chevron-up' : 'ti ti-chevron-down'} style={{ fontSize: 16, color: '#555' }} />
          </div>
          {openPanel === 'notif' && (
            <div className="setpanel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: '#ddd' }}>Unread badges</div>
                  <div style={{ fontSize: 11.5, color: '#666', marginTop: 2 }}>Show a count on chats with new messages</div>
                </div>
                <Toggle on={settings.showBadges} onChange={v => setOpt({ showBadges: v })} />
              </div>
            </div>
          )}

          {/* Privacy */}
          <div className="setrow" onClick={() => setOpenPanel(openPanel === 'privacy' ? null : 'privacy')} style={{ borderBottom: '0.5px solid #1e1e1e' }}>
            <i className="ti ti-lock" style={{ fontSize: 18, color: '#888', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#ccc' }}>Privacy</span>
            <i className={openPanel === 'privacy' ? 'ti ti-chevron-up' : 'ti ti-chevron-down'} style={{ fontSize: 16, color: '#555' }} />
          </div>
          {openPanel === 'privacy' && (
            <div className="setpanel">
              <div style={{ fontSize: 11.5, color: '#666', lineHeight: 1.55, padding: '6px 0 4px' }}>
                Your profile, preferences and allergies are stored against your account and are only readable by you. Your location is used to search for places and is never shared with other users.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: '#ddd' }}>Share my area with the assistant</div>
                  <div style={{ fontSize: 11.5, color: '#666', marginTop: 2 }}>Turn off and the assistant suggests without using your area</div>
                </div>
                <Toggle on={settings.aiUseLocation} onChange={v => setOpt({ aiUseLocation: v })} />
              </div>
            </div>
          )}

          {/* Location settings */}
          <div className="setrow" onClick={() => setOpenPanel(openPanel === 'loc' ? null : 'loc')} style={{ borderBottom: '0.5px solid #1e1e1e' }}>
            <i className="ti ti-map-pin" style={{ fontSize: 18, color: '#888', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#ccc' }}>Location settings</span>
            <i className={openPanel === 'loc' ? 'ti ti-chevron-up' : 'ti ti-chevron-down'} style={{ fontSize: 16, color: '#555' }} />
          </div>
          {openPanel === 'loc' && (
            <div className="setpanel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: '#ddd' }}>Use my live location</div>
                  <div style={{ fontSize: 11.5, color: '#666', marginTop: 2 }}>
                    {settings.useLiveLocation ? 'Results follow you as you move' : 'Fixed area: ' + (settings.areaLabel || profile?.postcode || 'not set')}
                  </div>
                </div>
                <Toggle on={settings.useLiveLocation} onChange={v => { setOpt({ useLiveLocation: v }); if (!v) setShowArea(true) }} />
              </div>
              <div onClick={() => setShowArea(true)} style={{ fontSize: 13, color: '#FF6B35', fontWeight: 600, padding: '8px 0 2px', cursor: 'pointer' }}>
                Change area
              </div>
            </div>
          )}

          {/* Help */}
          <div className="setrow" onClick={() => { window.location.href = 'mailto:johnpezterjaosn@gmail.com?subject=Outly%20support' }}>
            <i className="ti ti-help-circle" style={{ fontSize: 18, color: '#888', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#ccc' }}>Help and support</span>
            <i className="ti ti-chevron-right" style={{ fontSize: 16, color: '#333' }} />
          </div>
        </div>

        {showArea && <LocationPicker onClose={() => setShowArea(false)} />}

        <div style={{ margin: '12px 20px 0' }}>
          <button onClick={() => signOut()} style={{ width: '100%', background: 'rgba(255,59,48,0.1)', border: '0.5px solid rgba(255,59,48,0.25)', borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 600, color: '#ff3b30', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <i className="ti ti-logout" style={{ fontSize: 16 }} />
            Log out
          </button>
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}

function Row({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 10px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{title}</div>
      {action && <span style={{ fontSize: 12, color: '#FF6B35', fontWeight: 600, cursor: 'pointer' }} onClick={onAction}>{action}</span>}
    </div>
  )
}

function InfoCard({ items }) {
  return (
    <div style={{ margin: '0 20px', background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 14, overflow: 'hidden' }}>
      {items.map((item, i) => (
        <div key={item.label} onClick={item.onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < items.length-1 ? '0.5px solid #222' : 'none', cursor: 'pointer' }}>
          <i className={`ti ${item.icon}`} style={{ fontSize: 18, color: '#FF6B35', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{item.val}</div>
          </div>
          <i className="ti ti-chevron-right" style={{ fontSize: 16, color: '#444' }} />
        </div>
      ))}
    </div>
  )
}
