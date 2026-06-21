'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) return alert(error.message)
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6">
      <div className="mb-8">
        <div className="w-10 h-10 bg-[#2A323F] rounded-xl flex items-center justify-center mb-4">
          <span className="text-[#FFEF4D] text-xl font-bold">T</span>
        </div>
        <h1 className="text-2xl font-bold text-[#2A323F]">Welcome back</h1>
        <p className="text-gray-500 mt-1">Sign in to your Tripzy account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('email')} type="email" placeholder="Email"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A323F]" />
        <input {...register('password')} type="password" placeholder="Password"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A323F]" />
        <button type="submit" disabled={isSubmitting}
          className="w-full bg-[#2A323F] text-white font-bold py-4 rounded-xl mt-2 disabled:opacity-50">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        No account? <Link href="/register" className="text-[#2A323F] font-semibold">Create one</Link>
      </p>
    </div>
  )
}