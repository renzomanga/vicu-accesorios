'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { formatCantidadUnidad } from '@/lib/format'
import type { Insumo } from '@/types/database'

const VISIBLES_POR_DEFECTO = 3

export default function InsumosBajosCard({ insumos }: { insumos: Insumo[] }) {
  const [expandido, setExpandido] = useState(false)

  const visibles = expandido ? insumos : insumos.slice(0, VISIBLES_POR_DEFECTO)
  const ocultos = insumos.length - visibles.length

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-2 text-red-800">
        <AlertTriangle size={20} />
        <p className="font-semibold">Insumos bajos o agotados</p>
      </div>

      <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto text-sm text-red-700">
        {visibles.map((i) => (
          <li key={i.id}>
            {i.nombre} — quedan {formatCantidadUnidad(i.stock_actual, i.unidad_uso)}
            {i.stock_actual <= 0 ? ' (agotado)' : ''}
          </li>
        ))}
      </ul>

      {ocultos > 0 && (
        <button
          type="button"
          onClick={() => setExpandido(true)}
          className="self-start text-sm font-semibold text-red-800 underline"
        >
          Ver más ({ocultos})
        </button>
      )}

      <Link href="/insumos" className="text-sm font-semibold text-red-800 underline">
        Ver insumos
      </Link>
    </div>
  )
}
