'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loginDemo } from './actions'
import Image from 'next/image'
import {
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  Building,
  ShoppingBag,
  Wrench,
  Check,
} from 'lucide-react'

const DEMO_PRESETS = [
  {
    role: 'super_admin',
    name: 'Super Admin',
    email: 'admin@ambarrukmo.co.id',
    unit: 'Semua Unit (Akses Penuh)',
    icon: ShieldCheck,
    color: 'from-brand-400/20 to-brand-500/10 border-brand-400/40 text-brand-200',
  },
  {
    role: 'corporate_admin',
    name: 'Corporate Admin',
    email: 'corporate@ambarrukmo.co.id',
    unit: 'Kantor Pusat Ambarrukmo',
    icon: Building2,
    color: 'from-blue-500/20 to-blue-600/10 border-blue-400/40 text-blue-200',
  },
  {
    role: 'unit_admin_hotel',
    name: 'Admin Hotel',
    email: 'admin.hotel@ambarrukmo.co.id',
    unit: 'Royal Ambarrukmo Yogyakarta',
    icon: Building,
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/40 text-emerald-200',
  },
  {
    role: 'unit_admin_mall',
    name: 'Admin Mall',
    email: 'admin.mall@ambarrukmo.co.id',
    unit: 'Plaza Ambarrukmo Mall',
    icon: ShoppingBag,
    color: 'from-purple-500/20 to-purple-600/10 border-purple-400/40 text-purple-200',
  },
  {
    role: 'field_officer',
    name: 'Field Officer',
    email: 'field@ambarrukmo.co.id',
    unit: 'Operasional & Teknisi',
    icon: Wrench,
    color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-400/40 text-cyan-200',
  },
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  const [email, setEmail] = useState('admin@ambarrukmo.co.id')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault()
    const targetEmail = directEmail || email
    setLoading(true)
    setError(null)

    try {
      // 1. If Supabase is real and reachable, try normal auth
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const supabase = createClient()
        const { error: authErr } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password,
        })
        if (!authErr) {
          window.location.href = redirectTo
          return
        }
      }

      // 2. Prototype / Demo Fallback
      await loginDemo(targetEmail, redirectTo)
      window.location.href = redirectTo
    } catch (err: any) {
      setError(err?.message || 'Gagal masuk ke sistem. Silakan coba lagi.')
      setLoading(false)
      setLoadingPreset(null)
    }
  }

  const handleSelectPreset = async (presetEmail: string) => {
    setEmail(presetEmail)
    setPassword('admin123')
    setLoadingPreset(presetEmail)
    await handleLogin(undefined, presetEmail)
  }

  return (
    <div className="space-y-6">
      {/* Demo Notice Banner */}
      <div className="bg-brand-400/15 border border-brand-400/30 rounded-xl p-3.5 text-xs text-brand-100 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-brand-300 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-brand-200">Mode Prototipe / Demo Aktif:</span>
          <p className="text-brand-200/90 mt-0.5">
            Database cloud belum terhubung. Anda dapat langsung masuk dengan 1-klik akun demo di bawah atau gunakan email & sandi default <code className="bg-black/30 px-1 py-0.5 rounded text-brand-300 font-mono">admin123</code>.
          </p>
        </div>
      </div>

      {/* Quick 1-Click Demo Login */}
      <div>
        <button
          type="button"
          onClick={() => handleSelectPreset('admin@ambarrukmo.co.id')}
          disabled={loading}
          id="btn-quick-login-superadmin"
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-300 hover:to-brand-400
                     text-white font-bold py-3 px-4 rounded-xl transition-all duration-150 shadow-lg shadow-brand-900/40
                     disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-[0.99]"
        >
          {loadingPreset === 'admin@ambarrukmo.co.id' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses Masuk...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Masuk Cepat sebagai Super Admin
            </>
          )}
        </button>
      </div>

      {/* Preset Selector Grid */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-200 mb-2">
          Pilih Profil Akun Demo Lainnya:
        </label>
        <div className="grid grid-cols-1 gap-2">
          {DEMO_PRESETS.slice(1).map((preset) => {
            const Icon = preset.icon
            const isSelected = email === preset.email
            const isLoadingThis = loadingPreset === preset.email

            return (
              <button
                key={preset.email}
                type="button"
                onClick={() => handleSelectPreset(preset.email)}
                disabled={loading}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all bg-gradient-to-r ${preset.color} hover:border-white/40 hover:bg-white/10`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-white/10">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white flex items-center gap-1.5">
                      {preset.name}
                      <span className="text-[10px] text-white/60 font-mono">({preset.email})</span>
                    </div>
                    <div className="text-[11px] text-white/70">{preset.unit}</div>
                  </div>
                </div>
                {isLoadingThis ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : isSelected ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] bg-white/10 hover:bg-white/20 text-white/90 px-2 py-1 rounded">
                    Pilih
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-white/15 w-full"></div>
        <span className="bg-stone-900/60 px-3 text-[11px] uppercase tracking-wider text-brand-300/70 absolute">
          Atau Masuk Manual
        </span>
      </div>

      <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-brand-100 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300 pointer-events-none" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@ambarrukmo.co.id"
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-brand-300/60
                         rounded-lg pl-10 pr-4 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                         transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-brand-100 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-brand-300/60
                         rounded-lg pl-10 pr-10 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                         transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-300 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-heritage-500/20 border border-heritage-500/40 rounded-lg px-3.5 py-2.5 text-xs text-heritage-100">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          id="login-submit-btn"
          className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400
                     text-white font-semibold py-2.5 rounded-lg transition-all duration-150
                     disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-900/50
                     focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-transparent text-sm"
        >
          {loading && !loadingPreset ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses...
            </>
          ) : (
            'Masuk dengan Akun Ini'
          )}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="max-w-md w-full mx-auto py-8">
      {/* Logo */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-500/20 rounded-2xl shadow-xl mb-3 border border-brand-400/30 overflow-hidden p-2.5">
          <Image
            src="/logos/ambarrukmo-group.png"
            alt="Ambarrukmo Group"
            width={64}
            height={64}
            className="object-contain w-full h-full drop-shadow-md"
          />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-serif">Ambarrukmo</h1>
        <p className="text-brand-200 text-xs mt-0.5">Asset Management System (AAMS)</p>
        <p className="text-brand-300/50 text-[10px] mt-1 italic">Stay, Live, Experience Wholeheartedly</p>
      </div>

      {/* Card */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-7 shadow-2xl">
        <h2 className="text-base font-semibold text-white mb-5 flex items-center justify-between">
          <span>Masuk ke Akun Anda</span>
          <span className="text-[11px] font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Demo Prototype
          </span>
        </h2>
        <Suspense fallback={<div className="text-brand-200 text-center py-4 text-sm">Memuat form login...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="text-center text-brand-300/60 text-xs mt-5">
        © {new Date().getFullYear()} Ambarrukmo Group Yogyakarta
      </p>
    </div>
  )
}
