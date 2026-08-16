'use server'

import { createClient } from '@/lib/supabase/server'

export async function enviarMagicLink(
  _prevState: { ok: boolean; error: string | null },
  formData: FormData
) {
  const email = String(formData.get('email') || '').trim()
  if (!email) {
    return { ok: false, error: 'Ingresá un email' }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, error: null }
}
