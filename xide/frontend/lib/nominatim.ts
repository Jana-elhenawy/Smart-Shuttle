export interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

export async function geocodeAddress(query: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=eg`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Tripzy/1.0 tripzy@app.com' }
  })
  return res.json()
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Tripzy/1.0 tripzy@app.com' }
  })
  const data = await res.json()
  return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}