'use client'
import { useState } from 'react'
import { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form'
import { geocodeAddress, NominatimResult } from '@/lib/nominatim'
import { useRideStore } from '@/store/rideStore'
import { Navigation, MapPin } from 'lucide-react'

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
}

export default function LocationInputs<T extends FieldValues>({ register, errors }: Props<T>) {
  const { setPickup, setDestination } = useRideStore()
  const [pickupSuggestions, setPickupSuggestions] = useState<NominatimResult[]>([])
  const [destSuggestions, setDestSuggestions] = useState<NominatimResult[]>([])
  const [pickupVal, setPickupVal] = useState('')
  const [destVal, setDestVal] = useState('')

  const searchPickup = async (q: string) => {
    setPickupVal(q)
    if (q.length < 3) return setPickupSuggestions([])
    const results = await geocodeAddress(q)
    setPickupSuggestions(results.slice(0, 4))
  }

  const searchDest = async (q: string) => {
    setDestVal(q)
    if (q.length < 3) return setDestSuggestions([])
    const results = await geocodeAddress(q)
    setDestSuggestions(results.slice(0, 4))
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 mb-1 focus-within:border-[#2A323F]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#2A323F] shrink-0" />
        <input
          {...register('pickup_address' as Path<T>)}
          value={pickupVal}
          onChange={e => searchPickup(e.target.value)}
          placeholder="Pickup location"
          className="flex-1 text-sm outline-none text-[#2A323F] placeholder-gray-400" />
        <Navigation size={16} className="text-gray-400 shrink-0" />
      </div>
      {pickupSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {pickupSuggestions.map((s, i) => (
            <button key={i} type="button"
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
              onClick={() => {
                setPickup({ lat: parseFloat(s.lat), lng: parseFloat(s.lon), address: s.display_name })
                setPickupVal(s.display_name.split(',')[0])
                setPickupSuggestions([])
              }}>
              <span className="text-[#2A323F] font-medium">{s.display_name.split(',')[0]}</span>
              <span className="text-gray-400 text-xs ml-1">{s.display_name.split(',').slice(1,3).join(',')}</span>
            </button>
          ))}
        </div>
      )}

      <div className="ml-5 w-0.5 h-3 bg-gray-300 mb-1" />

      <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#2A323F]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFEF4D] border-2 border-[#2A323F] shrink-0" />
        <input
          {...register('dest_address' as Path<T>)}
          value={destVal}
          onChange={e => searchDest(e.target.value)}
          placeholder="Where to?"
          className="flex-1 text-sm outline-none text-[#2A323F] placeholder-gray-400" />
        <MapPin size={16} className="text-gray-400 shrink-0" />
      </div>
      {destSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {destSuggestions.map((s, i) => (
            <button key={i} type="button"
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
              onClick={() => {
                setDestination({ lat: parseFloat(s.lat), lng: parseFloat(s.lon), address: s.display_name })
                setDestVal(s.display_name.split(',')[0])
                setDestSuggestions([])
              }}>
              <span className="text-[#2A323F] font-medium">{s.display_name.split(',')[0]}</span>
              <span className="text-gray-400 text-xs ml-1">{s.display_name.split(',').slice(1,3).join(',')}</span>
            </button>
          ))}
        </div>
      )}

      {errors.pickup_address && <p className="text-red-500 text-xs mt-1">{String(errors.pickup_address.message)}</p>}
      {errors.dest_address && <p className="text-red-500 text-xs mt-1">{String(errors.dest_address.message)}</p>}
    </div>
  )
}