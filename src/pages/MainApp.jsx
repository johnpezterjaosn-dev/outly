import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import DinePage from './DinePage'
import DiscoverPage from './DiscoverPage'
import DiscussPage from './DiscussPage'
import ProfileOverlay from '../components/ProfileOverlay'

export default function MainApp() {
  const [tab, setTab] = useState('dine')
  const [showProfile, setShowProfile] = useState(false)
  const { profile } = useAuth()

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase() || '?'
    : '?'

  return (
    <div className="shell">
      {/* Top bar */}
      <div className="topbar">
        <div className="tabs">
          <button className={`tab ${tab === 'dine' ? 'on' : ''}`} onClick={() => setTab('dine')}>Dine</button>
          <button className={`tab ${tab === 'discover' ? 'on' : ''}`} onClick={() => setTab('discover')}>Discover</button>
          {tab === 'discuss' && <button className="tab on">Discuss</button>}
        </div>
        <button className="avatar-btn" onClick={() => setShowProfile(true)}>{initials}</button>
      </div>

      {/* Content */}
      <div className="scroll">
        {tab === 'dine' && <DinePage />}
        {tab === 'discover' && <DiscoverPage />}
        {tab === 'discuss' && <DiscussPage />}
      </div>

      {/* Bottom nav */}
      <nav className="bottomnav">
        <button className={`navbtn ${tab === 'dine' ? 'on' : ''}`} onClick={() => setTab('dine')}>
          <i className="ti ti-tools-kitchen-2" /><span>Dine</span>
        </button>
        <button className={`navbtn ${tab === 'discover' ? 'on' : ''}`} onClick={() => setTab('discover')}>
          <i className="ti ti-compass" /><span>Discover</span>
        </button>
        <button className={`navbtn ${tab === 'discuss' ? 'on' : ''}`} onClick={() => setTab('discuss')}>
          <i className="ti ti-message-circle-2" /><span>Discuss</span>
        </button>
      </nav>

      {showProfile && <ProfileOverlay onClose={() => setShowProfile(false)} />}
    </div>
  )
}
