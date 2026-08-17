'use client'

import { useState } from 'react'
import { formatARS, formatCantidadUnidad } from '@/lib/format'
import { actualizarCantidadReceta, quitarInsumoReceta } from '../actions'

type RecetaItem = {
  id: string
  cantidad_usada: number
  insumos: { id: string; nombre: string; unidad_uso: string; costo_unitario_ponderado: number } | null
}

export default function RecetaList({ receta, productoId }: { receta: RecetaItem[]; productoId: string }) {
  const [editandoId, setEditandoId] = useState<string | null>(null)

  return (
    <ul className="mb-4 flex flex-col gap-2">
      {receta.map((r) => {
        const editando = editandoId === r.id

        if (editando) {
          return (
            <li key={r.id} className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-cantera-ink">{r.insumos?.nombre}</span>
              <form
                action={async (formData) => {
                  await actualizarCantidadReceta(r.id, productoId, formData)
                  setEditandoId(null)
                }}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  name="cantidad_usada"
                  type="number"
                  step="any"
                  required
                  defaultValue={r.cantidad_usada}
                  autoFocus
                  className="w-24 rounded-lg border border-cantera-sand px-2 py-1.5 text-sm focus:border-cantera-primary focus:outline-none"
                />
                <span className="text-cantera-secondary">{r.insumos?.unidad_uso}</span>
                <button type="submit" className="text-emerald-700 underline">
                  Guardar
                </button>
                <button type="button" onClick={() => setEditandoId(null)} className="text-cantera-secondary underline">
                  Cancelar
                </button>
              </form>
            </li>
          )
        }

        return (
          <li key={r.id} className="flex items-start justify-between gap-3 text-sm">
            <span className="min-w-0 flex-1">
              {r.insumos?.nombre} — {formatCantidadUnidad(r.cantidad_usada, r.insumos?.unidad_uso ?? '')}
            </span>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-cantera-secondary">
                {formatARS(r.cantidad_usada * (r.insumos?.costo_unitario_ponderado ?? 0))}
              </span>
              <button type="button" onClick={() => setEditandoId(r.id)} className="text-cantera-secondary underline">
                Editar
              </button>
              <form action={quitarInsumoReceta.bind(null, r.id, productoId)}>
                <button type="submit" className="text-red-600 underline">
                  Quitar
                </button>
              </form>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
