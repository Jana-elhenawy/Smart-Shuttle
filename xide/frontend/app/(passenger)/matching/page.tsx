'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Users,
  Leaf,
  ChevronRight,
  Shield,
  Clock,
  Car,
  Zap,
} from 'lucide-react'
import { useRideStore } from '@/store/rideStore'
import TripzyLogo from '@/components/brand/TripzyLogo'

// ─── Mock data (replaces real AI response for demo) ────────────────────────────
const MOCK_MATCHES = [
  {
    id: 'p1',
    name: 'Ahmed',
    initials: 'AH',
    pickup: 'Maadi',
    pickupFull: 'Maadi Metro Station, Exit 2',
    walkMin: 3,
    match: 91,
    gender: 'MALE' as const,
    pickupTime: '8:15 AM',
    colorClass: 'bg-blue-100 text-blue-700',
    genderClass: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'p2',
    name: 'Mariam',
    initials: 'MA',
    pickup: 'Hadayek El Maadi',
    pickupFull: 'Hadayek El Maadi — Gate B',
    walkMin: 5,
    match: 88,
    gender: 'FEMALE' as const,
    pickupTime: '8:19 AM',
    colorClass: 'bg-pink-100 text-pink-700',
    genderClass: 'bg-purple-50 text-purple-600',
  },
  {
    id: 'p3',
    name: 'Youssef',
    initials: 'YO',
    pickup: 'Zahraa El Maadi',
    pickupFull: 'Zahraa El Maadi Roundabout',
    walkMin: 7,
    match: 84,
    gender: 'MALE' as const,
    pickupTime: '8:24 AM',
    colorClass: 'bg-amber-100 text-amber-700',
    genderClass: 'bg-blue-50 text-blue-600',
  },
]

const COST_SOLO = 60
const COST_SHARED = 15
const CO2_SAVED = 2.1

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function MatchingPage() {
  const router = useRouter()
  const { safeMode, destination } = useRideStore()

  // Scan animation phase
  const [phase, setPhase] = useState<'scanning' | 'results'>('scanning')
  const [scanProgress, setScanProgress] = useState(0)
  // Staggered card reveal
  const [visibleCards, setVisibleCards] = useState(0)

  // 1. Animate scan bar 0 → 100% over 1.6s, then switch to results
  useEffect(() => {
    const start = Date.now()
    const duration = 1600
    let rafId: number

    const tick = () => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setScanProgress(pct)
      if (pct < 100) {
        rafId = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setPhase('results'), 250)
      }
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // 2. Stagger passenger cards once results are visible
  useEffect(() => {
    if (phase !== 'results') return
    MOCK_MATCHES.forEach((_, i) => {
      setTimeout(() => setVisibleCards(i + 1), 150 + i * 280)
    })
  }, [phase])

  const savingPct = Math.round(((COST_SOLO - COST_SHARED) / COST_SOLO) * 100)
  const destLabel = destination?.address?.split(',')[0] ?? 'Cairo University'

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <TripzyLogo size={28} wordmarkClass="text-[#2A323F] font-bold text-sm" />
          <p className="text-xs text-gray-400 truncate mt-0.5">→ {destLabel}</p>
        </div>

        {safeMode && (
          <div className="flex items-center gap-1.5 bg-[#2A323F] text-[#FFEF4D] text-[10px] font-bold px-3 py-1.5 rounded-full flex-shrink-0">
            <Shield size={11} />
            Safe Mode ON
          </div>
        )}
      </div>

      {/* ── Scrollable body ────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-4 space-y-4 pb-8">

        {/* AI Scan card — always visible */}
        <div className="border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#2A323F] rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={18} className="text-[#FFEF4D]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#2A323F]">
                {phase === 'scanning'
                  ? 'AI scanning nearby passengers…'
                  : 'AI found 3 compatible passengers'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {phase === 'scanning'
                  ? 'Analysing route similarity & timing'
                  : `All heading to ${destLabel} via Maadi`}
              </p>
            </div>
          </div>

          {/* Scan progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2A323F] rounded-full"
              style={{ width: `${scanProgress}%`, transition: 'width 0.04s linear' }}
            />
          </div>

          {phase === 'results' && (
            <div className="flex items-center gap-2 mt-2.5">
              <div className="w-2 h-2 rounded-full bg-[#FFEF4D]" />
              <span className="text-[10px] font-bold text-[#2A323F] uppercase tracking-wider">
                Match complete — 91% avg similarity
              </span>
            </div>
          )}
        </div>

        {/* ── Everything below only shows after scanning ── */}
        {phase === 'results' && (
          <>
            {/* Passenger match cards */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-0.5">
                Matched passengers
              </p>
              <div className="flex gap-2">
                {MOCK_MATCHES.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex-1 border border-gray-200 rounded-2xl p-3 text-center relative"
                    style={{
                      opacity: visibleCards > i ? 1 : 0,
                      transform: visibleCards > i ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'opacity 0.35s ease, transform 0.35s ease',
                    }}
                  >
                    {/* Match % badge */}
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#FFEF4D] text-[#2A323F] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                      {p.match}%
                    </div>

                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-full mx-auto mt-2.5 mb-2 flex items-center justify-center text-sm font-bold ${p.colorClass}`}>
                      {p.initials}
                    </div>

                    <p className="text-xs font-bold text-[#2A323F]">{p.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{p.pickup}</p>
                    <p className="text-[10px] text-gray-500 mt-1.5">🚶 {p.walkMin} min walk</p>

                    {/* Gender tag — only shown when safe mode is on */}
                    {safeMode && (
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${p.genderClass}`}>
                        {p.gender === 'FEMALE' ? 'Female' : 'Male'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting point */}
            <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFEF4D] rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-[#2A323F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Suggested meeting point
                </p>
                <p className="text-sm font-bold text-[#2A323F] mt-0.5">
                  Maadi Metro Station — Exit 2
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Central for all passengers · max 7 min walk · well-lit
                </p>
              </div>
            </div>

            {/* Cost breakdown */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-0.5">
                Cost breakdown
              </p>
              <div className="flex gap-2.5">
                {/* Before */}
                <div className="flex-1 border border-gray-200 rounded-2xl p-4">
                  <p className="text-xs text-gray-400">Without Tripzy</p>
                  <p className="text-2xl font-bold text-gray-300 line-through mt-1">{COST_SOLO} EGP</p>
                  <p className="text-[10px] text-gray-400 mt-1.5">Per person, solo ride</p>
                </div>
                {/* After */}
                <div className="flex-1 bg-[#2A323F] rounded-2xl p-4">
                  <p className="text-xs text-[#FFEF4D]/70">With Tripzy</p>
                  <p className="text-2xl font-bold text-[#FFEF4D] mt-1">{COST_SHARED} EGP</p>
                  <span className="inline-block text-[10px] font-bold text-white bg-[#FFEF4D]/20 px-2 py-0.5 rounded-full mt-1.5">
                    ↓ Save {savingPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* CO2 savings */}
            <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Leaf size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#2A323F]">
                  {CO2_SAVED} kg CO₂ saved this trip
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  3 solo rides replaced by one — your share of a greener commute
                </p>
              </div>
            </div>

            {/* Pickup order timeline */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-0.5">
                Pickup order
              </p>
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                {MOCK_MATCHES.map((p, i) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i < MOCK_MATCHES.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#2A323F] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-[#FFEF4D]">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2A323F]">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.pickupFull}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                      <Clock size={12} />
                      {p.pickupTime}
                    </div>
                  </div>
                ))}

                {/* Destination row */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                  <div className="w-6 h-6 rounded-full bg-[#FFEF4D] flex items-center justify-center flex-shrink-0">
                    <Car size={12} className="text-[#2A323F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2A323F]">Cairo University — Main Gate</p>
                    <p className="text-xs text-gray-400">Est. arrival 8:48 AM · 24 min ride</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Safe Mode explanation — only when active */}
            {safeMode && (
              <div className="flex items-start gap-3 bg-[#2A323F]/5 border border-[#2A323F]/10 rounded-2xl p-4">
                <Shield size={15} className="text-[#2A323F] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#2A323F]">Safe Mode is active</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    All 3 passengers were matched based on the same-gender rule. Your ride is protected.
                  </p>
                </div>
              </div>
            )}

            {/* ── Primary CTA ── */}
            <button
              onClick={() => router.push('/tracking')}
              className="w-full bg-[#FFEF4D] text-[#2A323F] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 active:scale-[0.98] transition-transform"
            >
              <Users size={18} />
              Confirm Shared Ride
              <ChevronRight size={18} />
            </button>

            <p className="text-center text-xs text-gray-400 -mt-2">
              Trip #TZ-2847 · Driver will be notified upon confirmation
            </p>
          </>
        )}
      </div>
    </div>
  )
}
