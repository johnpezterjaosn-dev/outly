import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import DinePage from './DinePage'
import DiscoverPage from './DiscoverPage'
import DiscussPage from './DiscussPage'
import ProfileOverlay from '../components/ProfileOverlay'

export default function MainApp() {
  const { profile } = useAuth()
  // User picks Dine-first or Discover-first during onboarding — order + home tab follow it
  const first = profile?.first_tab === 'discover' ? 'discover' : 'dine'
  const second = first === 'dine' ? 'discover' : 'dine'
  const [tab, setTab] = useState(first)
  const [showProfile, setShowProfile] = useState(false)

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase() || '?'
    : '?'

  const label = t => t === 'dine' ? 'Dine' : 'Discover'

  return (
    <div className="shell">
      {/* Top bar */}
      <div className="topbar">
        <div className="tabs">
          <button className={`tab ${tab === first ? 'on' : ''}`} onClick={() => setTab(first)}>{label(first)}</button>
          <button className={`tab ${tab === second ? 'on' : ''}`} onClick={() => setTab(second)}>{label(second)}</button>
          {tab === 'discuss' && <button className="tab on">Discuss</button>}
        </div>
        <button className="avatar-btn" onClick={() => setShowProfile(true)}>{initials}</button>
      </div>

      {/* Content */}
      <div className={tab === 'discuss' ? 'scroll lock' : 'scroll'}>
        {tab === 'dine' && <DinePage />}
        {tab === 'discover' && <DiscoverPage />}
        {tab === 'discuss' && <DiscussPage />}
      </div>

      {/* Bottom nav */}
      <nav className="bottomnav">
        {[first, second].map(t => (
          <button key={t} className={`navbtn ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            <i className={`ti ${t === 'dine' ? 'ti-tools-kitchen-2' : 'ti-compass'}`} /><span>{label(t)}</span>
          </button>
        ))}
        <button className={`navbtn ${tab === 'discuss' ? 'on' : ''}`} onClick={() => setTab('discuss')}>
          <i className="ti ti-message-circle-2" /><span>Discuss</span>
        </button>
      </nav>

      {showProfile && <ProfileOverlay onClose={() => setShowProfile(false)} />}
    </div>
  )
}
