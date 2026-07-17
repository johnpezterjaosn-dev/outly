import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { geocodePostcode } from '../lib/places'

const ALLERGIES = [
  { e: '🥜', l: 'Nuts' }, { e: '🦐', l: 'Shellfish' }, { e: '🌾', l: 'Gluten' },
  { e: '🥛', l: 'Dairy' }, { e: '🥚', l: 'Egg' }, { e: '🫘', l: 'Soy' },
  { e: '🐟', l: 'Fish' }, { e: '🌱', l: 'Vegetarian' }, { e: '🥦', l: 'Vegan' },
  { e: '☪️', l: 'Halal' }, { e: '✡️', l: 'Kosher' }, { e: '✅', l: 'None' },
]

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

const STEPS = 5

function Header({ icon, title, sub }) {
  return (
    <>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 26, color: '#FF6B35' }} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>{sub}</div>
    </>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [allergies, setAllergies] = useState([])
  const [foods, setFoods] = useState([])
  const [budget, setBudget] = useState(null)
  const [locStatus, setLocStatus] = useState('idle') // idle | asking | granted | denied
  const [coords, setCoords] = useState(null)
  const [postcode, setPostcode] = useState('')
  const [firstTab, setFirstTab] = useState(null)
  const [saving, setSaving] = useState(false)
  const { updateProfile } = useAuth()
  const nav = useNavigate()

  const toggle = (setter) => (l) => {
    if (l === 'None') return setter(a => a.includes('None') ? [] : ['None'])
    setter(a => {
      const next = a.includes(l) ? a.filter(x => x !== l) : [...a.filter(x => x !== 'None'), l]
      return next
    })
  }
  const toggleAllergy = toggle(setAllergies)
  const toggleFood = (l) => setFoods(f => f.includes(l) ? f.filter(x => x !== l) : [...f, l])

  function askLocation() {
    setLocStatus('asking')
    if (!navigator.geolocation) return setLocStatus('denied')
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocStatus('granted') },
      () => setLocStatus('denied'),
      { timeout: 8000 }
    )
  }

  async function finish() {
    setSaving(true)
    let finalCoords = coords
    // Postcode fallback → approximate coords via Places text search (needs API key;
    // without one we still save the postcode and the app uses placeholder data)
    if (!finalCoords && postcode) {
      finalCoords = await geocodePostcode(postcode).catch(() => null)
    }
    try {
      await updateProfile({
        allergies,
        food_preferences: foods,
        budget,
        postcode: postcode || null,
        lat: finalCoords?.lat ?? null,
        lng: finalCoords?.lng ?? null,
        first_tab: firstTab,
        onboarding_complete: true,
      }).catch(() => {})
    } finally {
      nav('/')
    }
  }

  const Bar = () => (
    <div style={{ display: 'flex', gap: 6, padding: '20px 20px 0', flexShrink: 0 }}>
      {Array.from({ length: STEPS }, (_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? '#FF6B35' : '#222', opacity: i === step ? 0.6 : 1 }} />
      ))}
    </div>
  )

  const Footer = ({ next, nextLabel = 'Next', disabled }) => (
    <div style={{ padding: '16px 24px 32px' }}>
      <button className="btn btn-o" onClick={next} disabled={disabled}>{nextLabel}</button>
      {step > 0 && <button className="btn btn-g" onClick={() => setStep(step - 1)}>Back</button>}
    </div>
  )

  const wrap = (body, footer) => (
    <div className="shell">
      <Bar />
      <div className="scroll" style={{ paddingBottom: 0 }}>
        <div style={{ padding: '28px 24px 0' }}>{body}</div>
        {footer}
      </div>
    </div>
  )

  // STEP 0 — Allergies & dietary needs
  if (step === 0) return wrap(
    <>
      <Header icon="ti-alert-triangle" title="Any allergies or dietary needs?"
        sub="We'll filter out places that don't work for you. Tap all that apply." />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALLERGIES.map(a => (
          <div key={a.l} className={`chip ${allergies.includes(a.l) ? 'on' : ''}`} onClick={() => toggleAllergy(a.l)}>
            <span style={{ fontSize: 15 }}>{a.e}</span><span>{a.l}</span>
          </div>
        ))}
      </div>
    </>,
    <Footer next={() => setStep(1)} disabled={allergies.length === 0} />
  )

  // STEP 1 — Culinary preferences
  if (step === 1) return wrap(
    <>
      <Header icon="ti-salad" title="What do you like?"
        sub="Tap everything you enjoy — we'll personalise your feed." />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {FOODS.map(f => (
          <div key={f.l} className={`chip ${foods.includes(f.l) ? 'on' : ''}`} onClick={() => toggleFood(f.l)}>
            <span style={{ fontSize: 15 }}>{f.e}</span><span>{f.l}</span>
          </div>
        ))}
      </div>
      {foods.length > 0 && <div style={{ fontSize: 12, color: '#FF6B35', fontWeight: 700, textAlign: 'center', padding: '8px 0' }}>{foods.length} selected</div>}
    </>,
    <Footer next={() => setStep(2)} disabled={foods.length === 0} />
  )

  // STEP 2 — Budget
  if (step === 2) return wrap(
    <>
      <Header icon="ti-coin" title="What's your budget?"
        sub="Pick your usual spend per person when eating out." />
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
    </>,
    <Footer next={() => setStep(3)} disabled={!budget} />
  )

  // STEP 3 — Location (permission OR postcode fallback)
  if (step === 3) return wrap(
    <>
      <Header icon="ti-map-pin" title="Where are you?"
        sub="Outly uses your location to find the best nearby spots. Prefer not to share? Just enter your postcode instead." />

      {locStatus === 'granted' ? (
        <div style={{ background: 'rgba(255,107,53,0.1)', border: '1.5px solid #FF6B35', borderRadius: 16, padding: '20px', textAlign: 'center', marginBottom: 16 }}>
          <i className="ti ti-circle-check" style={{ fontSize: 36, color: '#FF6B35', display: 'block', marginBottom: 8 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Location locked in 📍</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>We'll show places near you</div>
        </div>
      ) : (
        <>
          <div style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 20, padding: '20px', textAlign: 'center', marginBottom: 12 }}>
            <i className="ti ti-current-location" style={{ fontSize: 40, color: '#FF6B35', marginBottom: 10, display: 'block' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Your location stays private</div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: 14 }}>Only used to find places. Never shared.</div>
            <button className="btn btn-o" onClick={askLocation} disabled={locStatus === 'asking'}>
              {locStatus === 'asking' ? 'Waiting for permission…' : 'Allow location'}
            </button>
          </div>
          {locStatus === 'denied' && (
            <div style={{ fontSize: 12, color: '#c96', textAlign: 'center', marginBottom: 12 }}>
              No worries — enter your postcode below and we'll use that instead.
            </div>
          )}
        </>
      )}

      {locStatus !== 'granted' && (
        <div className="fwrap">
          <div className="flabel">Or enter your postcode</div>
          <input className="finput" inputMode="numeric" maxLength={4} placeholder="e.g. 2150"
            value={postcode} onChange={e => setPostcode(e.target.value.replace(/\D/g, ''))} />
          <div style={{ fontSize: 11, color: '#555', marginTop: 6, lineHeight: 1.4 }}>
            Postcode gives results for your general area — similar spots, slightly less precise than live location.
          </div>
        </div>
      )}
    </>,
    <Footer next={() => setStep(4)} disabled={locStatus !== 'granted' && postcode.length !== 4} />
  )

  // STEP 4 — Which tab first: Dine or Discover?
  return wrap(
    <>
      <Header icon="ti-layout-grid" title="How do you plan a hangout?"
        sub="Pick what you want to see first. You can always switch tabs — this just sets your home screen." />
      <div style={{ display: 'grid', gap: 12 }}>
        {[
          { v: 'dine', e: '🍽️', t: 'Food first', s: 'Start with restaurants, then find something to do' },
          { v: 'discover', e: '🗺️', t: 'Place first', s: 'Start with locations and activities, then pick where to eat' },
        ].map(o => (
          <div key={o.v} onClick={() => setFirstTab(o.v)} style={{
            borderRadius: 16, padding: '20px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
            border: `1.5px solid ${firstTab === o.v ? '#FF6B35' : '#2a2a2a'}`,
            background: firstTab === o.v ? 'rgba(255,107,53,0.1)' : '#1a1a1a',
          }}>
            <div style={{ fontSize: 30 }}>{o.e}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: firstTab === o.v ? '#FF6B35' : '#fff' }}>{o.t}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{o.s}</div>
            </div>
          </div>
        ))}
      </div>
    </>,
    <Footer next={finish} nextLabel={saving ? 'Loading…' : "Let's go 🎉"} disabled={!firstTab || saving} />
  )
}
