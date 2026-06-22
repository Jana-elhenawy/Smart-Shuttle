import Image from 'next/image'

interface TripzyLogoProps {
  size?: number          // icon size in px
  showWordmark?: boolean // show "Tripzy" text next to icon
  wordmarkClass?: string
  className?: string
}

export default function TripzyLogo({
  size = 36,
  showWordmark = true,
  wordmarkClass = 'text-[#2A323F] font-bold text-lg',
  className = '',
}: TripzyLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="rounded-xl overflow-hidden flex-shrink-0 shadow-sm"
      >
        <Image
          src="/tripzy-logo.jpeg"
          alt="Tripzy"
          width={size}
          height={size}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      {showWordmark && (
        <span className={wordmarkClass}>Tripzy</span>
      )}
    </div>
  )
}
