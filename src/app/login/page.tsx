'use client'

import { useActionState } from 'react'
import { iniciarSesion } from './actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(iniciarSesion, {
    error: null,
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-rose-50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-rose-900">Vicu Accesorios</h1>
        <p className="mt-1 text-sm text-zinc-500">Ingresá con tu email y contraseña.</p>

        <form action={formAction} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="tu@email.com"
            className="rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-rose-500 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Contraseña"
            className="rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-rose-500 focus:outline-none"
          />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-rose-800 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
          >
            {pending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
