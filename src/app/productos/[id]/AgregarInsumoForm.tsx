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
          <Search size={18} className="pointer-events-none absolute left-3 text-cantera-neutral" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar insumo para agregar..."
            className="w-full rounded-lg border border-cantera-sand py-3 pl-10 pr-4 text-base focus:border-cantera-primary focus:outline-none"
          />
        </label>

        {busqueda.trim() !== '' && (
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-lg border border-cantera-sand">
            {filtrados.length === 0 && <p className="p-3 text-sm text-cantera-secondary">No encontramos insumos.</p>}
            {filtrados.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => {
                  setSeleccionado(i)
                  setBusqueda('')
                }}
                className="px-3 py-2.5 text-left text-sm hover:bg-cantera-primary/5"
              >
                {i.nombre} <span className="text-cantera-neutral">({i.unidad_uso})</span>
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
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="insumo_id" value={seleccionado.id} />
      <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-cantera-primary/10 px-3 py-2.5 sm:flex-1">
        <span className="min-w-0 truncate text-sm font-semibold text-cantera-primary">{seleccionado.nombre}</span>
        <button
          type="button"
          onClick={() => setSeleccionado(null)}
          className="flex shrink-0 items-center gap-1 text-xs text-cantera-primary underline"
        >
          <X size={14} /> Cambiar
        </button>
      </div>
      <div className="flex items-end gap-3">
        <label className="flex flex-1 flex-col gap-1.5 sm:w-28 sm:flex-none">
          <span className="text-sm font-medium text-cantera-secondary">Cantidad ({seleccionado.unidad_uso})</span>
          <input
            name="cantidad_usada"
            type="number"
            step="any"
            required
            autoFocus
            className="w-full rounded-lg border border-cantera-sand px-3 py-2.5 text-base focus:border-cantera-primary focus:outline-none"
          />
        </label>
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-cantera-secondary px-4 py-2.5 text-sm font-semibold text-white"
        >
          Agregar
        </button>
      </div>
    </form>
  )
}
