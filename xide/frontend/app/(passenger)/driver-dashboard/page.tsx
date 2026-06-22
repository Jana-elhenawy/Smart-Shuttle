'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, MapPin, Users, Clock, CheckCircle2,
  Phone, MessageSquare, Star, Navigation, Shield, ChevronRight, Car
} from 'lucide-react'
import TripzyLogo from '@/components/brand/TripzyLogo'

const PASSENGERS = [
  {
    id: 1, name: 'Ahmed', initials: 'AH', rating: 4.9,
    pickup: 'Maadi Metro Station — Exit 2', pickupTime: '8:15 AM',
    colorClass: 'bg-blue-100 text-blue-700', gender: 'MALE',
    status: 'waiting',
  },
  {
    id: 2, name: 'Mariam', initials: 'MA', rating: 5.0,
    pickup: 'Hadayek El Maadi — Gate B', pickupTime: '8:19 AM',
    colorClass: 'bg-pink-100 text-pink-700', gender: 'FEMALE',
    status: 'waiting',
  },
  {
    id: 3, name: 'Abdelrahman', initials: 'AB', rating: 4.7,
    pickup: 'Maadi Ring Road — Bus Stop 3', pickupTime: '8:22 AM',
    colorClass: 'bg-purple-100 text-purple-700', gender: 'MALE',
    status: 'waiting',
  },
  {
    id: 4, name: 'Youssef', initials: 'YO', rating: 4.8,
    pickup: 'Zahraa El Maadi Roundabout', pickupTime: '8:24 AM',
    colorClass: 'bg-amber-100 text-amber-700', gender: 'MALE',
    status: 'waiting',
  },
]

const TRIP = {
  id: 'TZ-245',
  destination: 'Cairo University — Main Gate',
  arrivalTime: '8:48 AM',
  distance: '12.4 km',
  duration: '24 min',
  totalEarnings: '60 EGP',
  status: 'Ready',
}

export default function DriverDashboard() {
  const router = useRouter()
  const [pickedUp, setPickedUp] = useState<number[]>([])
  const [rideStarted, setRideStarted] = useState(false)

  const allPickedUp = pickedUp.length === PASSENGERS.length

  const togglePickup = (id: number) => {
    setPickedUp(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">

      {/* ── HEADER ── */}
      <div className="bg-[#2A323F] px-4 pt-5 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()}
            className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <TripzyLogo size={30} wordmarkClass="text-white font-bold text-base" />
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 bg-[#FFEF4D] px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#2A323F] animate-pulse" />
            <span className="text-[11px] font-bold text-[#2A323F]">{TRIP.status}</span>
          </div>
        </div>

        {/* Trip ID + destination */}
        <div className="bg-white/10 rounded-2xl px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">Trip #{TRIP.id}</p>
              <p className="text-base font-bold text-white leading-tight">{TRIP.destination}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <Clock size={12} /> Est. {TRIP.arrivalTime}
                </span>
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <Navigation size={12} /> {TRIP.distance}
                </span>
                <span className="flex items-center gap-1 text-xs text-white/60">
                  <Car size={12} /> {TRIP.duration}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-white/50 font-medium">Earnings</p>
              <p className="text-xl font-bold text-[#FFEF4D]">{TRIP.totalEarnings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="flex gap-3 px-4 -mt-3 mb-4">
        {[
          { label: 'Passengers', value: `${PASSENGERS.length}`, icon: Users },
          { label: 'Picked up', value: `${pickedUp.length}/${PASSENGERS.length}`, icon: CheckCircle2 },
          { label: 'Remaining', value: `${PASSENGERS.length - pickedUp.length}`, icon: MapPin },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex-1 bg-white rounded-2xl shadow-sm px-3 py-3 text-center border border-gray-100">
            <Icon size={14} className="text-[#2A323F] mx-auto mb-1" />
            <p className="text-base font-bold text-[#2A323F]">{value}</p>
            <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* ── PICKUP ORDER LIST ── */}
      <div className="px-4 mb-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pickup Order</p>

        <div className="space-y-2">
          {PASSENGERS.map((p, i) => {
            const done = pickedUp.includes(p.id)
            return (
              <div key={p.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                  ${done ? 'border-green-200 bg-green-50/50' : 'border-gray-100 shadow-sm'}`}>
                <div className="flex items-center gap-3 px-4 py-3.5">

                  {/* Stop number */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm transition-colors
                    ${done ? 'bg-green-500 text-white' : 'bg-[#2A323F] text-[#FFEF4D]'}`}>
                    {done ? <CheckCircle2 size={14} /> : i + 1}
                  </div>

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${p.colorClass}`}>
                    {p.initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm font-bold truncate ${done ? 'text-gray-400 line-through' : 'text-[#2A323F]'}`}>
                        {p.name}
                      </p>
                      <div className="flex items-center gap-0.5">
                        <Star size={10} className="text-[#FFEF4D] fill-[#FFEF4D]" />
                        <span className="text-[10px] text-gray-400 font-medium">{p.rating}</span>
                      </div>
                      {p.gender === 'FEMALE' && (
                        <div className="flex items-center gap-1 bg-purple-50 px-1.5 py-0.5 rounded-full">
                          <Shield size={8} className="text-purple-500" />
                          <span className="text-[8px] font-bold text-purple-500">F</span>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs truncate ${done ? 'text-gray-300' : 'text-gray-400'}`}>
                      {p.pickup}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={9} /> {p.pickupTime}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Phone size={13} className="text-[#2A323F]" />
                    </button>
                    <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageSquare size={13} className="text-[#2A323F]" />
                    </button>
                    <button
                      onClick={() => togglePickup(p.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border
                        ${done
                          ? 'bg-green-100 text-green-600 border-green-200'
                          : 'bg-[#FFEF4D] text-[#2A323F] border-[#FFEF4D]'}`}
                    >
                      {done ? '✓ Got' : 'Pick'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Destination row */}
          <div className="bg-[#2A323F] rounded-2xl px-4 py-3.5 flex items-center gap-3 mt-3">
            <div className="w-7 h-7 rounded-full bg-[#FFEF4D] flex items-center justify-center flex-shrink-0">
              <MapPin size={13} className="text-[#2A323F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/50 font-medium mb-0.5">Final Destination</p>
              <p className="text-sm font-bold text-white truncate">{TRIP.destination}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-white/40">Arrival</p>
              <p className="text-sm font-bold text-[#FFEF4D]">{TRIP.arrivalTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── START RIDE CTA ── */}
      <div className="px-4 pb-6">
        {!rideStarted ? (
          <button
            onClick={() => setRideStarted(true)}
            disabled={!allPickedUp}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all
              ${allPickedUp
                ? 'bg-[#FFEF4D] text-[#2A323F] shadow-lg shadow-yellow-200/50 active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <Navigation size={18} />
            {allPickedUp ? 'Start Ride to Cairo University' : `Pick up ${PASSENGERS.length - pickedUp.length} more passenger${PASSENGERS.length - pickedUp.length > 1 ? 's' : ''} first`}
            {allPickedUp && <ChevronRight size={18} />}
          </button>
        ) : (
          <div className="bg-green-500 rounded-2xl py-4 px-4 flex items-center justify-center gap-2">
            <CheckCircle2 size={20} className="text-white" />
            <p className="text-white font-bold text-base">Ride in progress — heading to Cairo University</p>
          </div>
        )}
        {!allPickedUp && (
          <p className="text-center text-xs text-gray-400 mt-2">
            Mark each passenger as picked up to start the ride
          </p>
        )}
      </div>

    </div>
  )
}
