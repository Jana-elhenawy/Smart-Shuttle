import BottomNav from '@/components/layout/BottomNav'

export default function PassengerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-white relative overflow-hidden">
      <main className="flex-1 overflow-hidden relative">{children}</main>
      <BottomNav />
    </div>
  )
}
