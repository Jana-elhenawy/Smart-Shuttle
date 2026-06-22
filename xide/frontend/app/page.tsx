'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Users, Shield, Leaf, ChevronRight, Zap,
  MapPin, Clock, Star, ArrowRight, Check,
} from 'lucide-react'

/* ── tiny animated match card shown in hero ── */
function LiveMatchCard() {
  const [progress, setProgress] = useState(0)
  const [shown, setShown]       = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - start) / 2000) * 100))
      setProgress(pct)
      if (pct >= 100) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (progress < 100) return
    const timers = [0, 400, 800].map((d, i) =>
      setTimeout(() => setShown(i + 1), d)
    )
    return () => timers.forEach(clearTimeout)
  }, [progress])

  const matches = [
    { name: 'Ahmed',   pct: 91, color: 'bg-blue-100 text-blue-700',   init: 'AH' },
    { name: 'Mariam',  pct: 88, color: 'bg-pink-100 text-pink-700',   init: 'MA' },
    { name: 'Youssef', pct: 84, color: 'bg-amber-100 text-amber-700', init: 'YO' },
  ]

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-5 w-full max-w-xs mx-auto select-none">
      {/* scan bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-[#2A323F] rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-[#FFEF4D]" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-[#2A323F]">
            {progress < 100 ? 'AI scanning passengers…' : 'AI found 3 matches'}
          </p>
          <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-[#2A323F] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* passenger cards */}
      <div className="flex gap-2 mb-4">
        {matches.map((m, i) => (
          <div
            key={m.name}
            className="flex-1 border border-gray-100 rounded-2xl p-2.5 text-center relative"
            style={{
              opacity:   shown > i ? 1 : 0,
              transform: shown > i ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity .35s ease, transform .35s ease',
            }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#FFEF4D] text-[#2A323F] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {m.pct}%
            </div>
            <div className={`w-9 h-9 rounded-full mx-auto mt-2 mb-1.5 flex items-center justify-center text-xs font-bold ${m.color}`}>
              {m.init}
            </div>
            <p className="text-[11px] font-bold text-[#2A323F]">{m.name}</p>
          </div>
        ))}
      </div>

      {/* cost */}
      {shown >= 3 && (
        <div
          className="flex gap-2"
          style={{ animation: 'fadeUp .4s ease forwards' }}
        >
          <div className="flex-1 border border-gray-100 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-gray-400">Without Tripzy</p>
            <p className="text-base font-bold text-gray-300 line-through">60 EGP</p>
          </div>
          <div className="flex-1 bg-[#2A323F] rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-[#FFEF4D]/70">With Tripzy</p>
            <p className="text-base font-bold text-[#FFEF4D]">15 EGP</p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── step card ── */
function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 bg-[#FFEF4D] rounded-xl flex items-center justify-center flex-shrink-0 font-black text-[#2A323F] text-base shadow-sm">
        {n}
      </div>
      <div>
        <p className="font-bold text-[#2A323F] text-base">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

/* ── feature pill ── */
function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="w-11 h-11 bg-[#2A323F] rounded-xl flex items-center justify-center mb-4">
        <Icon size={20} className="text-[#FFEF4D]" />
      </div>
      <p className="font-bold text-[#2A323F] text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ══════════════ NAV ══════════════ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
              <Image src="/tripzy-logo.jpeg" alt="Tripzy" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-[#2A323F] text-lg tracking-tight">Tripzy</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/home')}
              className="hidden sm:block text-sm font-semibold text-gray-500 hover:text-[#2A323F] transition-colors px-3 py-1.5"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/home')}
              className="bg-[#2A323F] text-[#FFEF4D] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#1e252f] transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section className="bg-[#2A323F] px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#FFEF4D]/15 border border-[#FFEF4D]/30 px-4 py-1.5 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-[#FFEF4D] animate-pulse" />
              <span className="text-[#FFEF4D] text-xs font-bold uppercase tracking-wider">Smart Ride-Sharing · Cairo</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight mb-5">
              Ride Smart.<br />
              <span className="text-[#FFEF4D]">Ride Together.</span>
            </h1>

            <p className="text-white/60 text-base leading-relaxed mb-8 max-w-sm">
              Tripzy groups university students heading the same way into one shared ride.
              Split the cost, cut emissions, arrive together.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={() => router.push('/home')}
                className="flex items-center gap-2 bg-[#FFEF4D] text-[#2A323F] font-bold px-6 py-3.5 rounded-full hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/20 text-base"
              >
                Find Shared Ride
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => router.push('/driver')}
                className="flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/20 transition-colors text-base border border-white/20"
              >
                Driver Mode
              </button>
            </div>

            {/* trust row */}
            <div className="flex items-center gap-5">
              {[
                { val: '2.4k', label: 'Active riders' },
                { val: '75%', label: 'Avg savings' },
                { val: '4.9', label: 'App rating', icon: Star },
              ].map(({ val, label, icon: Icon }) => (
                <div key={label}>
                  <div className="flex items-center gap-1">
                    {Icon && <Icon size={13} className="text-[#FFEF4D] fill-[#FFEF4D]" />}
                    <span className="text-xl font-black text-white">{val}</span>
                  </div>
                  <p className="text-[11px] text-white/40 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — live demo card */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Live AI matching demo</p>
            <LiveMatchCard />
            <p className="text-white/30 text-xs">↑ Watch the AI find your ride-mates in real time</p>
          </div>

        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="px-5 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-[#FFEF4D] bg-[#2A323F] inline-block px-3 py-1 rounded-full uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl font-black text-[#2A323F]">Three steps to your shared ride</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Step n="1" title="Enter your route" desc="Type your pickup and destination. Tripzy knows every corner of Cairo." />
            <Step n="2" title="AI finds your group" desc="Our algorithm scans nearby students heading the same direction in real time." />
            <Step n="3" title="Share & save" desc="One car, split cost, less traffic. Everyone wins — including the planet." />
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section className="px-5 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#2A323F]">Built for students,<br />designed for safety</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Feature icon={Zap}    title="AI Route Matching"  desc="91% accuracy matching students headed the same way, within minutes." />
            <Feature icon={Shield} title="Safe Mode"          desc="Toggle on to match only with same-gender passengers. Always your choice." />
            <Feature icon={Users}  title="Cost Splitting"     desc="A 60 EGP ride becomes 15 EGP per person. Split fairly, automatically." />
            <Feature icon={Leaf}   title="Eco Impact"         desc="Every shared ride removes 2+ kg of CO₂. Small choice, real difference." />
          </div>
        </div>
      </section>

      {/* ══════════════ DEMO FLOW ══════════════ */}
      <section className="px-5 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#2A323F] rounded-3xl px-8 py-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <p className="text-[#FFEF4D] text-xs font-bold uppercase tracking-widest mb-3">Demo scenario</p>
              <h3 className="text-2xl font-black text-white mb-4 leading-tight">
                3 students, 1 ride,<br />Maadi → Cairo University
              </h3>
              <div className="space-y-2.5">
                {[
                  { name: 'Ahmed',   from: 'Maadi', match: '91%' },
                  { name: 'Mariam',  from: 'Hadayek El Maadi', match: '88%' },
                  { name: 'Youssef', from: 'Zahraa El Maadi', match: '84%' },
                ].map(p => (
                  <div key={p.name} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
                    <MapPin size={13} className="text-[#FFEF4D] flex-shrink-0" />
                    <span className="text-white text-sm font-semibold flex-1">{p.name} — {p.from}</span>
                    <span className="text-[#FFEF4D] text-xs font-bold bg-[#FFEF4D]/20 px-2 py-0.5 rounded-full">{p.match}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 mt-6">
                <div>
                  <p className="text-white/40 text-xs">Meeting point</p>
                  <p className="text-white font-bold text-sm mt-0.5">Maadi Metro — Exit 2</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Cost per person</p>
                  <p className="text-[#FFEF4D] font-black text-xl mt-0.5">15 EGP <span className="text-white/30 text-sm line-through font-normal">60</span></p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              {['Book ride', 'AI matches you', 'Meet at pickup', 'Arrive together'].map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#FFEF4D] flex items-center justify-center font-black text-[#2A323F] text-xs flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-white text-sm font-medium">{s}</p>
                  {i < 3 && <ArrowRight size={14} className="text-white/20 rotate-90 md:rotate-0" />}
                </div>
              ))}
              <button
                onClick={() => router.push('/book')}
                className="mt-4 flex items-center gap-2 bg-[#FFEF4D] text-[#2A323F] font-bold px-6 py-3 rounded-full hover:bg-yellow-300 transition-colors"
              >
                Try the demo <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="bg-[#2A323F] px-5 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
              <Image src="/tripzy-logo.jpeg" alt="Tripzy" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-black text-white text-base">Tripzy</p>
              <p className="text-white/40 text-xs">Ride Smart. Ride Together.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {['Safe Mode', 'AI Matching', 'Cost Splitting', 'Eco Friendly'].map(tag => (
              <span key={tag} className="text-[11px] font-semibold text-white/40 border border-white/10 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-white/30 text-xs">© 2026 Tripzy · Cairo, Egypt</p>
        </div>
      </footer>

    </div>
  )
}
