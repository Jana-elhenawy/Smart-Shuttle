'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, Clock, MapPin, Phone, MessageSquare,
  Star, Shield, ChevronRight, Car, Users, Navigation,
} from 'lucide-react'
import TripzyLogo from '@/components/brand/TripzyLogo'
import { useRideStore } from '@/store/rideStore'

const DRIVER = {
  name: 'Omar Hassan',
  initials: 'OH',
  rating: 4.92,
  trips: 1240,
  car: 'White Toyota Corolla',
  plate: 'أ · 8 8 4 · ق',
  phone: '+20 100 234 5678',
  eta: 4, // minutes
}

const RIDE_STEPS = [
  { label: 'Ride confirmed',       done: true,    active: false },
  { label: 'Driver assigned',      done: true,    active: false },
  { label: 'Driver on the way',    done: false,   active: true  },
  { label: 'Passengers picked up', done: false,   active: false },
  { label: 'Arriving at destination', done: false, active: false },
]

const CO_PASSENGERS = [
  { name: 'Ahmed',   initials: 'AH', colorClass: 'bg-blue-100 text-blue-700',   pickup: 'Maadi Metro' },
  { name: 'Mariam',  initials: 'MA', colorClass: 'bg-pink-100 text-pink-700',   pickup: 'Hadayek El Maadi' },
  { name: 'Youssef', initials: 'YO', colorClass: 'bg-amber-100 text-amber-700', pickup: 'Zahraa El Maadi' },
]

export default function TrackingPage() {
  const router = useRouter()
  const { safeMode } = useRideStore()
  const [eta, setEta] = useState(DRIVER.eta)

  // Count down ETA every 30s for demo realism
  useEffect(() => {
    const t = setInterval(() => setEta(e => Math.max(1, e - 1)), 30_000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">

      {/* ── DARK HERO HEADER ── */}
      <div className="bg-[#2A323F] px-4 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <TripzyLogo size={30} wordmarkClass="text-white font-bold text-base" />
          <div className="flex-1" />
          {safeMode && (
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Shield size={12} className="text-[#FFEF4D]" />
              <span className="text-[11px] font-bold text-[#FFEF4D]">Safe Mode</span>
            </div>
          )}
        </div>

        {/* Big confirmation tick */}
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-16 h-16 bg-[#FFEF4D] rounded-full flex items-center justify-center mb-3 shadow-lg shadow-yellow-400/30">
            <CheckCircle2 size={34} className="text-[#2A323F]" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Ride Confirmed!</h1>
          <p className="text-sm text-white/60">Your shared ride is booked — sit tight</p>
        </div>
      </div>

      {/* ── ETA CARD (overlaps header) ── */}
      <div className="px-4 -mt-5 mb-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#FFEF4D] rounded-xl flex items-center justify-center flex-shrink-0">
              <Car size={20} className="text-[#2A323F]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Driver arriving in</p>
              <p className="text-2xl font-bold text-[#2A323F]">{eta} min</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Trip ID</p>
            <p className="text-sm font-bold text-[#2A323F]">#TZ-245</p>
          </div>
        </div>
      </div>

      {/* ── RIDE STATUS STEPS ── */}
      <div className="px-4 mb-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Ride Status</p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 space-y-3">
          {RIDE_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                ${step.done ? 'bg-green-500' : step.active ? 'bg-[#FFEF4D]' : 'bg-gray-100'}`}>
                {step.done
                  ? <CheckCircle2 size={13} className="text-white" />
                  : step.active
                    ? <div className="w-2.5 h-2.5 rounded-full bg-[#2A323F] animate-pulse" />
                    : <div className="w-2 h-2 rounded-full bg-gray-300" />
                }
              </div>
              <p className={`text-sm font-medium ${step.done ? 'text-gray-400 line-through' : step.active ? 'text-[#2A323F] font-bold' : 'text-gray-300'}`}>
                {step.label}
              </p>
              {step.active && (
                <span className="ml-auto text-[10px] font-bold text-[#2A323F] bg-[#FFEF4D] px-2 py-0.5 rounded-full">
                  NOW
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── DRIVER CARD ── */}
      <div className="px-4 mb-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Your Driver</p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-[#2A323F] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#FFEF4D] font-bold text-lg">{DRIVER.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-[#2A323F]">{DRIVER.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={12} className="text-[#FFEF4D] fill-[#FFEF4D]" />
                <span className="text-sm font-semibold text-[#2A323F]">{DRIVER.rating}</span>
                <span className="text-xs text-gray-400">· {DRIVER.trips.toLocaleString()} trips</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Phone size={16} className="text-[#2A323F]" />
              </button>
              <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare size={16} className="text-[#2A323F]" />
              </button>
            </div>
          </div>

          {/* Car info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
            <Car size={16} className="text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#2A323F]">{DRIVER.car}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono tracking-widest">{DRIVER.plate}</p>
            </div>
            <div className="w-8 h-5 bg-[#2A323F] rounded flex items-center justify-center flex-shrink-0">
              <span className="text-[8px] text-[#FFEF4D] font-bold">EG</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CO-PASSENGERS ── */}
      <div className="px-4 mb-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Co-passengers · {CO_PASSENGERS.length} others
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {CO_PASSENGERS.map((p) => (
            <div key={p.name} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${p.colorClass}`}>
                {p.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#2A323F]">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={10} /> {p.pickup}
                </p>
              </div>
              <Users size={13} className="text-gray-300 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* ── MEETING POINT ── */}
      <div className="px-4 mb-4">
        <div className="bg-[#FFEF4D]/15 border border-[#FFEF4D] rounded-2xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFEF4D] rounded-xl flex items-center justify-center flex-shrink-0">
            <Navigation size={18} className="text-[#2A323F]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Your pickup point</p>
            <p className="text-sm font-bold text-[#2A323F] mt-0.5">Maadi Metro Station — Exit 2</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Clock size={10} /> Driver arrives at 8:15 AM · 3 min walk from you
            </p>
          </div>
        </div>
      </div>

      {/* ── COST SUMMARY ── */}
      <div className="px-4 mb-6">
        <div className="bg-[#2A323F] rounded-2xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50 font-medium">Your fare</p>
            <p className="text-2xl font-bold text-[#FFEF4D] mt-0.5">15 EGP</p>
            <p className="text-xs text-white/40 mt-0.5 line-through">60 EGP solo</p>
          </div>
          <div className="text-right">
            <div className="bg-[#FFEF4D]/20 rounded-xl px-3 py-2">
              <p className="text-xs text-white/60 font-medium">You saved</p>
              <p className="text-lg font-bold text-[#FFEF4D]">45 EGP</p>
              <p className="text-[10px] text-[#FFEF4D]/70">75% off solo price</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── DEMO: Switch to Driver View ── */}
      <div className="px-4 pb-6">
        <button
          onClick={() => router.push('/driver')}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-gray-400 hover:border-[#2A323F] hover:text-[#2A323F] transition-colors"
        >
          <Car size={16} />
          <span className="text-sm font-semibold">Switch to Driver View (Demo)</span>
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  )
}
