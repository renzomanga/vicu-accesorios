'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'

type InsumoOpcion = { id: string; nombre: string; unidad_uso: string }

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export default function AgregarInsumoForm({
  insumos,
  action,
}: {
  insumos: InsumoOpcion[]
  action: (formData: FormData) => void
}) {
  const [busqueda, setBusqueda] = useState('')
  const [seleccionado, setSeleccionado] = useState<InsumoOpcion | null>(null)

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda.trim())
    if (!q) return insumos
    return insumos.filter((i) => normalizar(i.nombre).includes(q))
  }, [insumos, busqueda])

  if (!seleccionado) {
    return (
      <div className="flex flex-col gap-3">
        <label className="relative flex items-center">
          <Search size={18} className="pointer-events-none absolute left-3 text-zinc-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar insumo para agregar..."
            className="w-full rounded-lg border border-zinc-300 py-3 pl-10 pr-4 text-base focus:border-rose-500 focus:outline-none"
          />
        </label>

        {busqueda.trim() !== '' && (
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-lg border border-zinc-200">
            {filtrados.length === 0 && <p className="p-3 text-sm text-zinc-500">No encontramos insumos.</p>}
            {filtrados.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => {
                  setSeleccionado(i)
                  setBusqueda('')
                }}
                className="px-3 py-2.5 text-left text-sm hover:bg-rose-50"
              >
                {i.nombre} <span className="text-zinc-400">({i.unidad_uso})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <form
      action={async (formData) => {
        await action(formData)
        setSeleccionado(null)
      }}
      className="flex items-end gap-3"
    >
      <input type="hidden" name="insumo_id" value={seleccionado.id} />
      <div className="flex flex-1 items-center justify-between gap-2 rounded-lg bg-rose-50 px-3 py-2.5">
        <span className="text-sm font-semibold text-rose-900">{seleccionado.nombre}</span>
        <button
          type="button"
          onClick={() => setSeleccionado(null)}
          className="flex shrink-0 items-center gap-1 text-xs text-rose-800 underline"
        >
          <X size={14} /> Cambiar
        </button>
      </div>
      <label className="flex w-28 flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700">Cantidad ({seleccionado.unidad_uso})</span>
        <input
          name="cantidad_usada"
          type="number"
          step="any"
          required
          autoFocus
          className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base focus:border-rose-500 focus:outline-none"
        />
      </label>
      <button type="submit" className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-white">
        Agregar
      </button>
    </form>
  )
}
