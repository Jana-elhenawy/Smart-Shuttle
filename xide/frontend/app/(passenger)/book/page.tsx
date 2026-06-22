'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, Lock, Calendar, Clock, Users, ChevronRight, Zap } from 'lucide-react'
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

const TIME_PRESETS = ['Now', '08:00', '08:30', '09:00', '09:30', '10:00']

export default function BookPage() {
  const router = useRouter()
  const { pickup, destination, safeMode, setCurrentRequest } = useRideStore()

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pickup_address: pickup?.address || '',
      dest_address: destination?.address || '',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '08:30',
    }
  })

  const selectedTime = watch('scheduled_time')

  const onSubmit = async (data: FormData) => {
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

      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <button onClick={() => router.back()}
          className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <ArrowLeft size={18} className="text-[#2A323F]" />
        </button>
        <TripzyLogo size={30} wordmarkClass="text-[#2A323F] font-bold text-base" />
        <div className="flex-1" />
        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">Plan your ride</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col px-4 py-5 gap-5">

        {/* ── SECTION 1: ROUTE ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Route</p>

          {/* Route card with dot-line connector */}
          <div className="border border-gray-200 rounded-2xl overflow-visible bg-white shadow-sm">
            <div className="px-4 pt-4 pb-2 relative">

              {/* Pickup row */}
              <div className="flex items-center gap-3 mb-1">
                <div className="flex flex-col items-center gap-0 flex-shrink-0 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-[#2A323F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup</p>
                </div>
              </div>

              {/* Pickup input */}
              <div className="ml-6 mb-2">
                <LocationInputs register={register} errors={errors} />
              </div>

            </div>
          </div>
        </div>

        {/* ── SECTION 2: SCHEDULE ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Departure Time</p>

          {/* Quick time chips */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
            {TIME_PRESETS.map((t) => {
              const val = t === 'Now' ? new Date().toTimeString().slice(0,5) : t
              const active = selectedTime === val || (t === 'Now' && selectedTime === new Date().toTimeString().slice(0,5))
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('scheduled_time', val)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all
                    ${active
                      ? 'bg-[#2A323F] text-[#FFEF4D] border-[#2A323F]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                >
                  {t}
                </button>
              )
            })}
          </div>

          {/* Date + Time pickers */}
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-3 focus-within:border-[#2A323F] bg-gray-50 transition-colors">
              <Calendar size={15} className="text-gray-400 flex-shrink-0" />
              <input
                type="date"
                {...register('scheduled_date')}
                className="flex-1 text-sm outline-none bg-transparent text-[#2A323F] min-w-0"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-3 focus-within:border-[#2A323F] bg-gray-50 transition-colors">
              <Clock size={15} className="text-gray-400 flex-shrink-0" />
              <input
                type="time"
                {...register('scheduled_time')}
                className="flex-1 text-sm outline-none bg-transparent text-[#2A323F] min-w-0"
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 3: SAFE MODE ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Safety</p>
          <div className="border border-gray-200 rounded-2xl px-4 py-4 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                ${safeMode ? 'bg-[#2A323F]' : 'bg-gray-100'}`}>
                <Shield size={18} className={safeMode ? 'text-[#FFEF4D]' : 'text-gray-400'} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#2A323F]">Safe Mode</span>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-[#2A323F] bg-[#FFEF4D] px-2 py-0.5 rounded-full">
                    <Lock size={8} /> HARD RULE
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Match only with same gender passengers</p>
              </div>
            </div>
            <SafeModeToggle />
          </div>
          {safeMode && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-[#FFEF4D]/15 rounded-xl border border-[#FFEF4D]/40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2A323F] flex-shrink-0" />
              <p className="text-xs text-[#2A323F] font-medium">Safe Mode is active — only same-gender matches will be shown</p>
            </div>
          )}
        </div>

        {/* ── SECTION 4: FARE ESTIMATE ── */}
        <div className="bg-[#2A323F] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFEF4D]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-[#FFEF4D]" />
            </div>
            <div>
              <p className="text-xs text-white/60 font-medium">Estimated fare</p>
              <p className="text-[11px] text-white/40 mt-0.5">Split between matched passengers</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#FFEF4D]">15–25</p>
            <p className="text-xs text-white/50">EGP / person</p>
          </div>
        </div>

        {/* ── CTA BUTTON ── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#FFEF4D] text-[#2A323F] font-bold py-4 rounded-2xl disabled:opacity-50
            flex items-center justify-center gap-2 text-base shadow-lg shadow-yellow-200/50
            active:scale-[0.98] transition-all"
        >
          <Zap size={18} className="text-[#2A323F]" />
          {isSubmitting ? 'Finding matches…' : 'Find My Matches'}
          <ChevronRight size={18} />
        </button>

        <p className="text-center text-xs text-gray-400 -mt-3 pb-4">
          AI will scan nearby passengers heading the same way
        </p>

      </form>
    </div>
  )
}
