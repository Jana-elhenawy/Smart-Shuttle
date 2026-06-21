'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(11).max(11),
  password: z.string().min(8),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    if (error || !authData.user) return alert(error?.message)

    await supabase.from('users').insert({
      user_id: authData.user.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      user_type: 'PASSENGER',
    })

    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12">
      <div className="mb-8">
        <div className="w-10 h-10 bg-[#2A323F] rounded-xl flex items-center justify-center mb-4">
          <span className="text-[#FFEF4D] text-xl font-bold">T</span>
        </div>
        <h1 className="text-2xl font-bold text-[#2A323F]">Create account</h1>
        <p className="text-gray-500 mt-1">Join Tripzy — ride smarter, together</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input {...register('name')} placeholder="Full name"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A323F]" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <input {...register('email')} type="email" placeholder="Email"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A323F]" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <input {...register('phone')} placeholder="01XXXXXXXXX"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A323F]" />
        </div>
        <div>
          <input {...register('password')} type="password" placeholder="Password (min 8 chars)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A323F]" />
        </div>
        <div>
          <select {...register('gender')}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A323F] bg-white">
            <option value="">Select gender</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <button type="submit" disabled={isSubmitting}
          className="w-full bg-[#FFEF4D] text-[#2A323F] font-bold py-4 rounded-xl mt-2 disabled:opacity-50">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account? <Link href="/login" className="text-[#2A323F] font-semibold">Sign in</Link>
      </p>
    </div>
  )
}