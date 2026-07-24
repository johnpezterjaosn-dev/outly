// Per-user app settings, stored on the device. Simple, private, no server round trip.
const KEY = uid => 'outly:settings:' + (uid || 'anon')

const DEFAULTS = {
  useLiveLocation: true,   // follow the phone's GPS each session
  areaLabel: '',           // manually chosen area, e.g. "Blacktown"
  aiUseLocation: true,     // let the assistant use the area for suggestions
}

export function getSettings(uid) {
  try {
    const raw = localStorage.getItem(KEY(uid))
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(uid, patch) {
  const next = { ...getSettings(uid), ...patch }
  try { localStorage.setItem(KEY(uid), JSON.stringify(next)) } catch {}
  window.dispatchEvent(new CustomEvent('outly-settings', { detail: next }))
  return next
}
