import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const { signIn, signUp } = useAuth()
  const nav = useNavigate()

  const [lf, setLf] = useState({ email: '', password: '' })
  const [sf, setSf] = useState({ firstName: '', lastName: '', username: '', email: '', password: '' })

  async function doLogin(e) {
    e.preventDefault()
    setLoading(true); setErr('')
    try { await signIn(lf); nav('/') }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  async function doSignup(e) {
    e.preventDefault()
    setLoading(true); setErr('')
    try { await signUp(sf); nav('/onboarding') }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="shell" style={{ justifyContent: 'flex-start', overflowY: 'auto' }}>
      <div style={{ padding: '40px 28px 32px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <i className="ti ti-map-pin" style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>outly</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>plan hangouts, discover places</div>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {['login', 'signup'].map(t => (
            <button key={t} onClick={() => { setTab(t); setErr('') }} style={{
              flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 700,
              borderRadius: 9, border: 'none', cursor: 'pointer',
              background: tab === t ? '#FF6B35' : 'transparent',
              color: tab === t ? '#fff' : '#555',
            }}>
              {t === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        {err && <div className="err">{err}</div>}

        {tab === 'login' ? (
          <form onSubmit={doLogin}>
            <div className="fwrap">
              <div className="flabel"><i className="ti ti-mail" />Email</div>
              <input className="finput" type="email" placeholder="you@email.com" value={lf.email} onChange={e => setLf(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="fwrap">
              <div className="flabel"><i className="ti ti-lock" />Password</div>
              <input className="finput" type="password" placeholder="••••••••" value={lf.password} onChange={e => setLf(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: '#FF6B35', marginBottom: 24, cursor: 'pointer' }}>Forgot password?</div>
            <button className="btn btn-o" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
          </form>
        ) : (
          <form onSubmit={doSignup}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="fwrap" style={{ flex: 1 }}>
                <div className="flabel"><i className="ti ti-user" />First</div>
                <input className="finput" placeholder="Jason" value={sf.firstName} onChange={e => setSf(f => ({ ...f, firstName: e.target.value }))} required />
              </div>
              <div className="fwrap" style={{ flex: 1 }}>
                <div className="flabel"><i className="ti ti-user" />Last</div>
                <input className="finput" placeholder="John" value={sf.lastName} onChange={e => setSf(f => ({ ...f, lastName: e.target.value }))} required />
              </div>
            </div>
            <div className="fwrap">
              <div className="flabel"><i className="ti ti-at" />Username</div>
              <input className="finput" placeholder="@yourname" value={sf.username} onChange={e => setSf(f => ({ ...f, username: e.target.value }))} required />
            </div>
            <div className="fwrap">
              <div className="flabel"><i className="ti ti-mail" />Email</div>
              <input className="finput" type="email" placeholder="you@email.com" value={sf.email} onChange={e => setSf(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="fwrap">
              <div className="flabel"><i className="ti ti-lock" />Password</div>
              <input className="finput" type="password" placeholder="••••••••" value={sf.password} onChange={e => setSf(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button className="btn btn-o" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: '0.5px', background: '#222' }} />
          <span style={{ fontSize: 12, color: '#555' }}>or</span>
          <div style={{ flex: 1, height: '0.5px', background: '#222' }} />
        </div>

        <button style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 14, padding: 13, fontSize: 14, fontWeight: 600, color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#555', marginTop: 16 }}>
          {tab === 'login'
            ? <span>Don't have an account? <span style={{ color: '#FF6B35', fontWeight: 700, cursor: 'pointer' }} onClick={() => setTab('signup')}>Sign up</span></span>
            : <span>Already have an account? <span style={{ color: '#FF6B35', fontWeight: 700, cursor: 'pointer' }} onClick={() => setTab('login')}>Log in</span></span>
          }
        </div>
      </div>
    </div>
  )
}
