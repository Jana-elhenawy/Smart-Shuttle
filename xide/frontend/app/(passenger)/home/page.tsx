'use client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Search, Shield, Clock, ChevronRight, Menu, Maximize2 } from 'lucide-react'
import { useRideStore } from '@/store/rideStore'
import TripzyLogo from '@/components/brand/TripzyLogo'
import Image from 'next/image'

const RideMap = dynamic(() => import('@/components/ride/RideMap'), { ssr: false })

const RECENTS = [
  { name: 'Cairo University, FCAI', address: 'Faculty of Computers and Artificial Intelligence…', lat: 30.0264, lng: 31.2131 },
  { name: 'Tahrir Square', address: 'Downtown Cairo, Egypt', lat: 30.0444, lng: 31.2357 },
]

const PROMO = {
  bg: 'bg-[#2A323F]',
  title: 'Ride Smart. Save More.',
  sub: 'Share your ride, split the cost — up to 75% off solo fares',
  badge: 'NEW',
}

export default function HomePage() {
  const router = useRouter()
  const { safeMode, setSafeMode, setDestination } = useRideStore()

  const handleRecent = (item: typeof RECENTS[0]) => {
    setDestination({ lat: item.lat, lng: item.lng, address: item.name })
    router.push('/book')
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* ── FULL-SCREEN MAP ── */}
      <RideMap className="absolute inset-0 z-0" />

      {/* ── TOP LEFT: hamburger + Safe Mode ── */}
      <div className="absolute top-5 left-4 z-20 flex flex-col gap-2">
        <button className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center">
          <Menu size={20} className="text-[#2A323F]" />
        </button>
        <button
          onClick={() => setSafeMode(!safeMode)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border transition-all duration-300
            ${safeMode
              ? 'bg-[#2A323F] border-[#2A323F] text-white'
              : 'bg-white border-gray-100 text-[#2A323F]'}`}
        >
          <Shield size={14} className={safeMode ? 'text-[#FFEF4D]' : 'text-gray-400'} />
          <span className="text-xs font-bold">Safety</span>
        </button>
      </div>

      {/* ── TOP RIGHT: expand button ── */}
      <div className="absolute top-5 right-4 z-20">
        <button className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center">
          <Maximize2 size={18} className="text-[#2A323F]" />
        </button>
      </div>

      {/* ── BOTTOM SHEET (DiDi-style) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-white rounded-t-3xl shadow-2xl">

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* ── "Where to?" search bar ── */}
          <div className="px-4 pt-2 pb-3">
            <button
              onClick={() => router.push('/book')}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 flex items-center gap-4 text-left active:bg-gray-100 transition-colors"
            >
              <div className="w-9 h-9 bg-[#2A323F] rounded-xl flex items-center justify-center flex-shrink-0">
                <Search size={17} className="text-[#FFEF4D]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-[#2A323F] leading-tight">Where to?</p>
              </div>
            </button>
          </div>

          {/* ── Recent destinations ── */}
          <div className="px-4 pb-2">
            {RECENTS.map((item) => (
              <button
                key={item.name}
                onClick={() => handleRecent(item)}
                className="w-full flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 text-left group"
              >
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2A323F] truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{item.address}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#2A323F] transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* ── Promo banner (like DiDi ad cards) ── */}
          <div className="px-4 pb-4">
            <div className={`${PROMO.bg} rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden`}>
              {/* decorative circles */}
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5" />
              <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-[#FFEF4D]/10" />

              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                <Image src="/tripzy-logo.jpeg" alt="Tripzy" width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-[#FFEF4D] text-[#2A323F] px-2 py-0.5 rounded-full">{PROMO.badge}</span>
                </div>
                <p className="text-sm font-bold text-white leading-tight">{PROMO.title}</p>
                <p className="text-[11px] text-white/60 mt-0.5 leading-snug">{PROMO.sub}</p>
              </div>
            </div>
          </div>

          {/* Safe Mode banner when active */}
          {safeMode && (
            <div className="mx-4 mb-4 flex items-center gap-3 bg-[#FFEF4D]/15 border border-[#FFEF4D] rounded-2xl px-4 py-3">
              <Shield size={18} className="text-[#2A323F] flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#2A323F]">Safe Mode is ON</p>
                <p className="text-[11px] text-gray-500 mt-0.5">You'll only be matched with same-gender passengers</p>
              </div>
              <button
                onClick={() => setSafeMode(false)}
                className="ml-auto text-[10px] font-bold text-gray-400 underline flex-shrink-0"
              >
                Off
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
