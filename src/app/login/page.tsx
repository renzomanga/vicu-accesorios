'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import { iniciarSesion } from './actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<{ error: string | null }, FormData>(iniciarSesion, {
    error: null,
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cantera-base px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <Image src="/isotipo.svg" alt="" width={40} height={40} className="mb-4 h-10 w-10" />
        <h1 className="font-caslon text-2xl text-cantera-ink">Cantera Joyas</h1>
        <p className="mt-1 text-sm text-cantera-secondary">Ingresá con tu email y contraseña.</p>

        <form action={formAction} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="tu@email.com"
            className="rounded-lg border border-cantera-sand px-4 py-3 text-base focus:border-cantera-primary focus:outline-none"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Contraseña"
            className="rounded-lg border border-cantera-sand px-4 py-3 text-base focus:border-cantera-primary focus:outline-none"
          />
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-cantera-primary px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
          >
            {pending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
