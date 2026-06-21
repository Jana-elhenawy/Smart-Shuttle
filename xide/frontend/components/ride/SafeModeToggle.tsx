'use client'
import { useRideStore } from '@/store/rideStore'

export default function SafeModeToggle() {
  const { safeMode, setSafeMode } = useRideStore()

  return (
    <button
      type="button"
      onClick={() => setSafeMode(!safeMode)}
      className={`w-10 h-[22px] rounded-full transition-colors relative flex-shrink-0
        ${safeMode ? 'bg-[#2A323F]' : 'bg-gray-300'}`}
      aria-label="Toggle Safe Mode"
      role="switch"
      aria-checked={safeMode}>
      <div className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform
        ${safeMode ? 'translate-x-5 left-0' : 'left-0.5'}`} />
    </button>
  )
}