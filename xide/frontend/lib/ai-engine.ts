import type { AiMatchRequest, AiMatchResponse } from '@/types'

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000'

export async function matchPassengers(payload: AiMatchRequest): Promise<AiMatchResponse> {
  const res = await fetch(`${AI_ENGINE_URL}/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`AI engine error: ${res.status}`)
  return res.json()
}

export async function suggestPickupMeetup(
  pointA: { lat: number; lng: number },
  pointB: { lat: number; lng: number }
) {
  const res = await fetch(`${AI_ENGINE_URL}/suggest/pickup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ point_a: pointA, point_b: pointB }),
  })
  return res.json()
}

export async function suggestDestinationMeetup(
  pointA: { lat: number; lng: number },
  pointB: { lat: number; lng: number }
) {
  const res = await fetch(`${AI_ENGINE_URL}/suggest/destination`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ point_a: pointA, point_b: pointB }),
  })
  return res.json()
}

export async function optimizePickupOrder(
  passengers: Array<{ passenger_id: string; pickup: { lat: number; lng: number } }>,
  driver_location: { lat: number; lng: number }
) {
  const res = await fetch(`${AI_ENGINE_URL}/optimize/pickup-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passengers, driver_location }),
  })
  return res.json()
}