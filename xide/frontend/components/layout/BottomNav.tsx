'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Clock, MapPin, User, Plus } from 'lucide-react'
import Image from 'next/image'

const navItems = [
  { href: '/home',     icon: Home,   label: 'Home' },
  { href: '/history',  icon: Clock,  label: 'History' },
  { href: '/tracking', icon: MapPin, label: 'Track' },
  { href: '/profile',  icon: User,   label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="h-[72px] bg-white border-t border-gray-100 flex items-center justify-around px-2 flex-shrink-0 relative">
      {navItems.slice(0, 2).map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}
          className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors
            ${pathname === href ? 'text-[#2A323F]' : 'text-gray-300 hover:text-gray-400'}`}>
          <Icon size={21} strokeWidth={pathname === href ? 2.5 : 1.8} />
          <span className={`text-[10px] font-medium ${pathname === href ? 'font-bold' : ''}`}>{label}</span>
        </Link>
      ))}

      {/* Center FAB with logo */}
      <Link href="/book"
        className="w-14 h-14 bg-[#2A323F] rounded-full flex items-center justify-center -mt-6 shadow-xl shadow-gray-900/30 ring-4 ring-white overflow-hidden flex-shrink-0">
        <Image
          src="/tripzy-logo.jpeg"
          alt="Tripzy"
          width={56}
          height={56}
          className="w-full h-full object-cover"
        />
      </Link>

      {navItems.slice(2).map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}
          className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors
            ${pathname === href ? 'text-[#2A323F]' : 'text-gray-300 hover:text-gray-400'}`}>
          <Icon size={21} strokeWidth={pathname === href ? 2.5 : 1.8} />
          <span className={`text-[10px] font-medium ${pathname === href ? 'font-bold' : ''}`}>{label}</span>
        </Link>
      ))}
    </nav>
  )
}
