import { useState, useEffect } from 'react'
import { getPlaceDetails, photoUrl, transitLink, hasPlacesKey } from '../lib/places'

// Slide-up detail panel for a restaurant or place.
// Shows photos, rating, reviews, opening hours, website/menu link + transit directions.
export default function PlaceDetailOverlay({ place, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true
    if (place?.id && hasPlacesKey()) {
      getPlaceDetails(place.id).then(d => { if (live) { setDetail(d); setLoading(false) } })
    } else setLoading(false)
    return () => { live = false }
  }, [place?.id])

  if (!place) return null
  const photos = detail?.photos ?? (place.photo ? [{ name: place.photo }] : [])
  const reviews = detail?.reviews ?? []
  const rating = detail?.rating ?? place.rating
  const count = detail?.userRatingCount ?? place.ratingCount
  const lat = detail?.location?.latitude ?? place.lat
  const lng = detail?.location?.longitude ?? place.lng
  const website = detail?.websiteUri
  const maps = detail?.googleMapsUri
  const openNow = detail?.currentOpeningHours?.openNow ?? place.openNow
  const hours = detail?.currentOpeningHours?.weekdayDescriptions

  return (
    <div className="overlay">
      <div className="ovhead">
        <button className="ovback" onClick={onClose}><i className="ti ti-arrow-left" style={{ fontSize: 18, color: '#fff' }} /></button>
        <div className="ovtitle">{place.name}</div>
        <div style={{ width: 36 }} />
      </div>

      <div className="ovscroll">
        {/* Photo strip */}
        {photos.length > 0 && hasPlacesKey() ? (
          <div className="hscroll" style={{ padding: '12px 16px 4px' }}>
            {photos.slice(0, 6).map((ph, i) => (
              <img key={i} src={photoUrl(ph.name, 500)} alt={place.name}
                style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 16, flexShrink: 0, border: '0.5px solid #2a2a2a' }} />
            ))}
          </div>
        ) : (
          <div style={{ margin: '12px 16px 4px', height: 160, borderRadius: 16, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, border: '0.5px solid #2a2a2a' }}>
            {place.e ?? '📍'}
          </div>
        )}

        {/* Summary row */}
        <div style={{ padding: '14px 20px 4px' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{place.name}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            {place.type || detail?.primaryTypeDisplayName?.text || ''}
            {rating && <> · ⭐ {rating}{count ? ` (${count})` : ''}</>}
            {place.dist && <> · {place.dist}</>}
          </div>
          {openNow !== undefined && (
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, color: openNow ? '#3aad6e' : '#c96' }}>
              {openNow ? 'Open now' : 'Closed'}
            </div>
          )}
          {detail?.formattedAddress && <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{detail.formattedAddress}</div>}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 20px' }}>
          {(lat && lng) && (
            <a className="btn btn-o" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              href={transitLink(lat, lng)} target="_blank" rel="noreferrer">
              <i className="ti ti-bus" /> Get there
            </a>
          )}
          {(website || maps) && (
            <a className="btn btn-g" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              href={website ?? maps} target="_blank" rel="noreferrer">
              <i className="ti ti-tools-kitchen-2" /> {website ? 'Menu / website' : 'View on Maps'}
            </a>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#555', padding: '0 20px 8px', lineHeight: 1.4 }}>
          "Get there" opens Google Maps with public transport directions.
        </div>

        {/* Opening hours */}
        {hours && (
          <>
            <div className="slabel"><i className="ti ti-clock" />Hours</div>
            <div style={{ padding: '0 20px 8px' }}>
              {hours.map(h => <div key={h} style={{ fontSize: 12, color: '#888', lineHeight: 1.8 }}>{h}</div>)}
            </div>
          </>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <>
            <div className="slabel"><i className="ti ti-star" />Reviews</div>
            {reviews.slice(0, 4).map((r, i) => (
              <div key={i} style={{ margin: '0 16px 10px', background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 14, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{r.authorAttribution?.displayName ?? 'Guest'}</span>
                  <span style={{ fontSize: 12, color: '#FF6B35', fontWeight: 700 }}>⭐ {r.rating}</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#aaa', lineHeight: 1.5 }}>
                  {(r.text?.text ?? '').slice(0, 240)}{(r.text?.text?.length ?? 0) > 240 ? '…' : ''}
                </div>
              </div>
            ))}
          </>
        )}

        {loading && hasPlacesKey() && (
          <div style={{ textAlign: 'center', color: '#666', fontSize: 13, padding: 20 }}>Loading details…</div>
        )}
        {!hasPlacesKey() && (
          <div style={{ margin: '8px 16px 24px', background: '#1a1a1a', border: '0.5px dashed #2a2a2a', borderRadius: 14, padding: '14px', fontSize: 12, color: '#666', lineHeight: 1.5 }}>
            Add <b style={{ color: '#FF6B35' }}>VITE_GOOGLE_PLACES_KEY</b> to see real photos, reviews, menus and opening hours here.
          </div>
        )}
        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
