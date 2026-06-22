'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, Lock } from 'lucide-react'
import { useRideStore } from '@/store/rideStore'
import LocationInputs from '@/components/ride/LocationInputs'
import SafeModeToggle from '@/components/ride/SafeModeToggle'
import TripzyLogo from '@/components/brand/TripzyLogo'

const schema = z.object({
  pickup_address: z.string().min(3, 'Enter pickup location'),
  dest_address: z.string().min(3, 'Enter destination'),
  scheduled_date: z.string(),
  scheduled_time: z.string(),
})
type FormData = z.infer<typeof schema>

export default function BookPage() {
  const router = useRouter()
  const { pickup, destination, safeMode, setCurrentRequest } = useRideStore()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pickup_address: pickup?.address || '',
      dest_address: destination?.address || '',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '08:30',
    }
  })

  const onSubmit = async (data: FormData) => {
    // ── Demo mode: skip Supabase, go straight to matching ────────────
    // Store a mock request in Zustand so matching page can read pickup/dest
    setCurrentRequest({
      request_id: 'demo-001',
      passenger_id: 'demo-user',
      pickup: { lat: pickup?.lat ?? 30.037, lng: pickup?.lng ?? 31.212, address: data.pickup_address },
      destination: { lat: destination?.lat ?? 30.026, lng: destination?.lng ?? 31.213, address: data.dest_address },
      scheduled_time: new Date(`${data.scheduled_date}T${data.scheduled_time}:00`).toISOString(),
      safe_mode: safeMode,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    })
    router.push('/matching')
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <button onClick={() => router.back()}
          className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <TripzyLogo size={30} wordmarkClass="text-[#2A323F] font-bold text-base" />
        <div className="flex-1" />
        <span className="text-xs text-gray-400 font-medium">Plan your ride</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0 p-4">
        <LocationInputs register={register} errors={errors} />

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Schedule</p>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
            <input type="date" {...register('scheduled_date')}
              className="flex-1 text-sm outline-none bg-transparent text-[#2A323F]" />
          </div>
          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
            <input type="time" {...register('scheduled_time')}
              className="flex-1 text-sm outline-none bg-transparent text-[#2A323F]" />
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 mb-4">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-[#2A323F]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#2A323F]">Safe Mode</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#2A323F] bg-[#FFEF4D] px-2 py-0.5 rounded-full">
                  <Lock size={9} /> Hard rule
                </span>
              </div>
              <p className="text-xs text-gray-400">Match only with same gender</p>
            </div>
          </div>
          <SafeModeToggle />
        </div>

        <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400">Estimated fare</p>
            <p className="text-xs text-gray-400">Split between matched passengers</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#2A323F]">25–35 EGP</p>
            <p className="text-xs text-gray-400">per person</p>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-[#FFEF4D] text-[#2A323F] font-bold py-4 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
          {isSubmitting ? 'Submitting…' : '✦ Find My Matches'}
        </button>
      </form>
    </div>
  )
}