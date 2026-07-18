import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import MainApp from './pages/MainApp'

// Splash with staged messaging — free-tier Supabase can take a while to wake
// from auto-pause, so tell the user what's happening instead of hanging silently.
function Splash() {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 6000)
    const t2 = setTimeout(() => setStage(2), 18000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', gap: 14, padding: 24 }}>
      <span style={{ color: '#FF6B35', fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>outly</span>
      {stage >= 1 && (
        <div style={{ fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 1.5, maxWidth: 260 }}>
          Waking up the database… free hosting naps when nobody's around. Give it a minute ⏳
        </div>
      )}
      {stage >= 2 && (
        <button onClick={() => window.location.reload()} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 12, padding: '10px 22px', fontSize: 13, fontWeight: 600, color: '#FF6B35', cursor: 'pointer' }}>
          Taking too long — tap to retry
        </button>
      )}
    </div>
  )
}

function Guard({ children, allowOnboarding }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <Navigate to="/login" replace />
  // New (e.g. Google) users who haven't done the quiz go straight to it
  if (!allowOnboarding && profile && !profile.onboarding_complete) return <Navigate to="/onboarding" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/onboarding" element={<Guard allowOnboarding><OnboardingPage /></Guard>} />
      <Route path="/*" element={<Guard><MainApp /></Guard>} />
    </Routes>
  )
}
