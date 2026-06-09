import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FOODS = [
  { e: '🍔', l: "McDonald's" }, { e: '🍗', l: 'KFC' }, { e: '🍕', l: "Domino's" },
  { e: '🌮', l: 'Taco Bell' }, { e: '🥪', l: 'Subway' }, { e: '🍣', l: 'Japanese' },
  { e: '🍜', l: 'Vietnamese' }, { e: '🥘', l: 'Chinese' }, { e: '🍛', l: 'Indian' },
  { e: '🥙', l: 'Lebanese' }, { e: '🍝', l: 'Italian' }, { e: '🌯', l: 'Mexican' },
  { e: '🥩', l: 'Steakhouse' }, { e: '🍱', l: 'Korean BBQ' }, { e: '🥗', l: 'Healthy' },
  { e: '☕', l: 'Café' }, { e: '🍦', l: 'Dessert' }, { e: '🍺', l: 'Bar & Grill' },
]

const BUDGETS = [
  { e: '🤑', range: '$5 – $10', label: 'Budget friendly', v: '5-10' },
  { e: '😋', range: '$11 – $20', label: 'Everyday eats', v: '11-20' },
  { e: '🍽️', range: '$20 – $50', label: 'Treat yourself', v: '20-50' },
  { e: '✨', range: 'Any budget', label: 'Show me everything', v: 'any' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [budget, setBudget] = useState(null)
  const [foods, setFoods] = useState([])
  const [saving, setSaving] = useState(false)
  const { updateProfile } = useAuth()
  const nav = useNavigate()

  function toggleFood(l) {
    setFoods(f => f.includes(l) ? f.filter(x => x !== l) : [...f, l])
  }

  async function finish() {
    setSaving(true)
    try {
      // Try to save to DB — won't crash if it fails
      await updateProfile({ budget, food_preferences: foods, onboarding_complete: true }).catch(() => {})
    } finally {
      nav('/')
    }
  }

  const Bar = () => (
    <div style={{ display: 'flex', gap: 6, padding: '20px 20px 0', flexShrink: 0 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? '#FF6B35' : '#222', opacity: i === step ? 0.6 : 1 }} />
      ))}
    </div>
  )

  if (step === 0) return (
    <div className="shell">
      <Bar />
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <div style={{ padding: '28px 24px 0' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <i className="ti ti-map-pin" style={{ fontSize: 26, color: '#FF6B35' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Enable location</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>Outly uses your location to show the best nearby places and help plan hangouts.</div>
          <div style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 20, padding: '24px 20px', textAlign: 'center', marginBottom: 16 }}>
            <i className="ti ti-current-location" style={{ fontSize: 44, color: '#FF6B35', marginBottom: 12, display: 'block' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Your location stays private</div>
            <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>We only use it to find places. Never shared.</div>
          </div>
          {[
            { icon: 'ti-building-store', text: 'Find restaurants and hangout spots near you' },
            { icon: 'ti-users', text: 'Help friends plan meetups at convenient spots' },
            { icon: 'ti-star', text: 'Get personalised recommendations' },
          ].map(r => (
            <div key={r.icon} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#1a1a1a', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
              <i className={`ti ${r.icon}`} style={{ fontSize: 18, color: '#FF6B35', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#aaa', lineHeight: 1.4 }}>{r.text}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 24px 32px' }}>
          <button className="btn btn-o" onClick={() => { setStep(1); navigator.geolocation?.getCurrentPosition(() => {}, () => {}) }}>
            Allow location
          </button>
        </div>
      </div>
    </div>
  )

  if (step === 1) return (
    <div className="shell">
      <Bar />
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <div style={{ padding: '28px 24px 0' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <i className="ti ti-coin" style={{ fontSize: 26, color: '#FF6B35' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>What's your budget?</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>Pick your usual spend per person when eating out.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {BUDGETS.map(b => (
              <div key={b.v} onClick={() => setBudget(b.v)} style={{
                borderRadius: 16, padding: '18px 14px', cursor: 'pointer', textAlign: 'center',
                border: `1.5px solid ${budget === b.v ? '#FF6B35' : '#2a2a2a'}`,
                background: budget === b.v ? 'rgba(255,107,53,0.1)' : '#1a1a1a',
              }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{b.e}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: budget === b.v ? '#FF6B35' : '#fff', marginBottom: 4 }}>{b.range}</div>
                <div style={{ fontSize: 11, color: '#666' }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 24px 32px' }}>
          <button className="btn btn-o" onClick={() => setStep(2)} disabled={!budget}>Next</button>
          <button className="btn btn-g" onClick={() => setStep(0)}>Back</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="shell">
      <Bar />
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <div style={{ padding: '28px 24px 0' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <i className="ti ti-salad" style={{ fontSize: 26, color: '#FF6B35' }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>What do you like?</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>Tap everything you enjoy — we'll personalise your feed.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {FOODS.map(f => (
              <div key={f.l} className={`chip ${foods.includes(f.l) ? 'on' : ''}`} onClick={() => toggleFood(f.l)}>
                <span style={{ fontSize: 15 }}>{f.e}</span>
                <span>{f.l}</span>
              </div>
            ))}
          </div>
          {foods.length > 0 && <div style={{ fontSize: 12, color: '#FF6B35', fontWeight: 700, textAlign: 'center', padding: '8px 0' }}>{foods.length} selected</div>}
        </div>
        <div style={{ padding: '16px 24px 32px' }}>
          <button className="btn btn-o" onClick={finish} disabled={foods.length === 0 || saving}>
            {saving ? 'Loading...' : "Let's go 🎉"}
          </button>
          <button className="btn btn-g" onClick={() => setStep(1)}>Back</button>
        </div>
      </div>
    </div>
  )
}
