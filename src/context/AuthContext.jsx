import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      setProfile(data)
      refreshLocation(data, userId)
    }
  }

  // Live location: each session, quietly try to get the user's CURRENT position.
  // Success -> use it for this session's searches and persist it to the profile,
  // so results follow the user (Blacktown today, Parramatta tomorrow).
  // Denied/unavailable -> stored coords (GPS from onboarding, or postcode geocode) remain the fallback.
  function refreshLocation(prof, userId) {
    if (!prof?.onboarding_complete || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude
        // ignore tiny drift (<300m) to avoid pointless writes
        const moved = !prof.lat || Math.abs(lat - prof.lat) > 0.003 || Math.abs(lng - prof.lng) > 0.003
        setProfile(p => p ? { ...p, lat, lng, location_live: true } : p)
        if (moved) {
          await supabase.from('profiles').update({ lat, lng }).eq('id', userId)
        }
      },
      () => {}, // denied or unavailable: keep stored coords, no nagging
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 }
    )
  }

  async function signUp({ email, password, firstName, lastName, username }) {
    // Sign up the user
    const { error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) throw signUpError

    // Auto sign in immediately so session is active
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) throw signInError

    // Create their profile row
    if (signInData?.user) {
      await supabase.from('profiles').upsert({
        id: signInData.user.id,
        first_name: firstName,
        last_name: lastName,
        username: username.replace('@', ''),
        email,
      })
      await fetchProfile(signInData.user.id)
    }

    return signInData
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function updateProfile(updates) {
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
