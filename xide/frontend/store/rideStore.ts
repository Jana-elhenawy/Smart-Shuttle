import { create } from 'zustand'
import type { Location, RideRequest, MatchResult, Ride } from '@/types'

interface RideStore {
  pickup: Location | null
  destination: Location | null
  scheduledTime: Date
  safeMode: boolean
  currentRequest: RideRequest | null
  matchResult: MatchResult | null
  activeRide: Ride | null
  setPickup: (loc: Location) => void
  setDestination: (loc: Location) => void
  setScheduledTime: (date: Date) => void
  setSafeMode: (on: boolean) => void
  setCurrentRequest: (r: RideRequest | null) => void
  setMatchResult: (m: MatchResult | null) => void
  setActiveRide: (ride: Ride | null) => void
  resetBooking: () => void
}

export const useRideStore = create<RideStore>((set) => ({
  pickup: null,
  destination: null,
  scheduledTime: new Date(),
  safeMode: false,
  currentRequest: null,
  matchResult: null,
  activeRide: null,
  setPickup: (loc) => set({ pickup: loc }),
  setDestination: (loc) => set({ destination: loc }),
  setScheduledTime: (date) => set({ scheduledTime: date }),
  setSafeMode: (on) => set({ safeMode: on }),
  setCurrentRequest: (r) => set({ currentRequest: r }),
  setMatchResult: (m) => set({ matchResult: m }),
  setActiveRide: (ride) => set({ activeRide: ride }),
  resetBooking: () => set({ pickup: null, destination: null, currentRequest: null, matchResult: null }),
}))