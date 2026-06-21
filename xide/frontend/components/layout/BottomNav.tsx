'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Clock, MapPin, User, Plus } from 'lucide-react'

const navItems = [
  { href: '/home',    icon: Home,   label: 'Home' },
  { href: '/history', icon: Clock,  label: 'History' },
  { href: '/tracking', icon: MapPin, label: 'Track' },
  { href: '/profile', icon: User,   label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="h-[72px] bg-white border-t border-gray-100 flex items-center justify-around px-2 pb-2 flex-shrink-0">
      {navItems.slice(0, 2).map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}
          className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors
            ${pathname === href ? 'text-[#2A323F]' : 'text-gray-400'}`}>
          <Icon size={22} />
          <span className="text-[10px] font-medium">{label}</span>
        </Link>
      ))}

      <Link href="/book"
        className="w-14 h-14 bg-[#FFEF4D] rounded-full flex items-center justify-center -mt-5 shadow-lg shadow-yellow-200">
        <Plus size={28} className="text-[#2A323F]" />
      </Link>

      {navItems.slice(2).map(({ href, icon: Icon, label }) => (
        <Link key={href} href={href}
          className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors
            ${pathname === href ? 'text-[#2A323F]' : 'text-gray-400'}`}>
          <Icon size={22} />
          <span className="text-[10px] font-medium">{label}</span>
        </Link>
      ))}
    </nav>
  )
}