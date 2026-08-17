'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Check } from 'lucide-react'

export default function BotonGuardar({
  label = 'Guardar',
  labelPendiente = 'Guardando...',
}: {
  label?: string
  labelPendiente?: string
}) {
  const { pending } = useFormStatus()
  const [guardado, setGuardado] = useState(false)
  const eraPendiente = useRef(false)

  useEffect(() => {
    const terminoAhora = eraPendiente.current && !pending
    eraPendiente.current = pending
    if (!terminoAhora) return

    setGuardado(true)
    const t = setTimeout(() => setGuardado(false), 2500)
    return () => clearTimeout(t)
  }, [pending])

  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-cantera-primary px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
      >
        {pending ? labelPendiente : label}
      </button>
      {guardado && (
        <span className="flex items-center gap-1 text-sm font-medium text-emerald-700">
          <Check size={16} /> Guardado
        </span>
      )}
    </div>
  )
}
