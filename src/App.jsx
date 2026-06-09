import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import MainApp from './pages/MainApp'

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
      <span style={{ color: '#FF6B35', fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>outly</span>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/onboarding" element={<Guard><OnboardingPage /></Guard>} />
      <Route path="/*" element={<Guard><MainApp /></Guard>} />
    </Routes>
  )
}
