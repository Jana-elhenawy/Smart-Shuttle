'use client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Search, Shield } from 'lucide-react'
import { useRideStore } from '@/store/rideStore'

const RideMap = dynamic(() => import('@/components/ride/RideMap'), { ssr: false })

const RECENTS = [
  { name: 'Cairo University, FCAI', address: 'Giza, Cairo', lat: 30.0264, lng: 31.2131 },
  { name: 'Tahrir Square', address: 'Downtown Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Home', address: 'Dokki, Giza', lat: 30.0376, lng: 31.2122 },
]

export default function HomePage() {
  const router = useRouter()
  const { safeMode, setSafeMode, setDestination } = useRideStore()

  const handleRecent = (item: typeof RECENTS[0]) => {
    setDestination({ lat: item.lat, lng: item.lng, address: item.name })
    router.push('/book')
  }

  return (
    <div className="relative h-full">
      <RideMap className="absolute inset-0" />

      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[#2A323F] rounded-lg flex items-center justify-center">
            <span className="text-[#FFEF4D] font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-[#2A323F] text-lg">Tripzy</span>
        </div>
        <button onClick={() => router.push('/book')}
          className="w-full bg-white rounded-full px-4 py-3 flex items-center gap-3 shadow-lg text-left">
          <Search size={18} className="text-gray-400" />
          <span className="text-gray-400 text-sm">Where are you going?</span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 space-y-3">
        <button
          onClick={() => setSafeMode(!safeMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all
            ${safeMode ? 'bg-[#2A323F] border-[#2A323F] text-white' : 'bg-white border-gray-200 text-[#2A323F]'}`}>
          <Shield size={16} className={safeMode ? 'text-[#FFEF4D]' : 'text-gray-400'} />
          <span className="text-sm font-semibold">Safe Mode</span>
          <div className={`w-7 h-4 rounded-full transition-colors relative ${safeMode ? 'bg-[#FFEF4D]' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform
              ${safeMode ? 'translate-x-3.5 left-0' : 'left-0.5'}`} />
          </div>
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Recent</p>
          {RECENTS.map((item) => (
            <button key={item.name} onClick={() => handleRecent(item)}
              className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors text-left">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search size={15} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2A323F] truncate">{item.name}</p>
                <p className="text-xs text-gray-400">{item.address}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}