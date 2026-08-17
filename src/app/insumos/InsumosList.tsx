'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { formatARS, formatCantidadUnidad } from '@/lib/format'
import type { Insumo } from '@/types/database'

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

type Estado = 'todos' | 'ok' | 'bajo' | 'agotado'

function estadoInsumo(i: Insumo): { label: string; className: string; estado: Estado } {
  if (i.stock_actual <= 0) return { label: 'Agotado', className: 'bg-red-100 text-red-800', estado: 'agotado' }
  if (i.stock_actual <= i.stock_minimo)
    return { label: 'Bajo', className: 'bg-amber-100 text-amber-800', estado: 'bajo' }
  return { label: 'OK', className: 'bg-emerald-100 text-emerald-800', estado: 'ok' }
}

const FILTROS: { value: Estado; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'ok', label: 'OK' },
  { value: 'bajo', label: 'Bajo' },
  { value: 'agotado', label: 'Agotado' },
]

type Orden = 'nombre' | 'stock_asc' | 'stock_desc'

export default function InsumosList({ insumos }: { insumos: Insumo[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<Estado>('todos')
  const [orden, setOrden] = useState<Orden>('nombre')

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda.trim())

    let resultado = insumos.filter((i) => {
      const coincideTexto = !q || normalizar(i.nombre).includes(q) || (i.sku && normalizar(i.sku).includes(q))
      const coincideEstado = filtro === 'todos' || estadoInsumo(i).estado === filtro
      return coincideTexto && coincideEstado
    })

    resultado = [...resultado].sort((a, b) => {
      if (orden === 'stock_asc') return a.stock_actual - b.stock_actual
      if (orden === 'stock_desc') return b.stock_actual - a.stock_actual
      return a.nombre.localeCompare(b.nombre, 'es')
    })

    return resultado
  }, [insumos, busqueda, filtro, orden])

  return (
    <div className="flex flex-col gap-4">
      <label className="relative flex items-center">
        <Search size={18} className="pointer-events-none absolute left-3 text-zinc-400" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="w-full rounded-lg border border-zinc-300 py-3 pl-10 pr-4 text-base focus:border-rose-500 focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFiltro(f.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filtro === f.value ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as Orden)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
        >
          <option value="nombre">Ordenar: nombre A-Z</option>
          <option value="stock_asc">Ordenar: stock (menos a más)</option>
          <option value="stock_desc">Ordenar: stock (más a menos)</option>
        </select>
      </div>

      {filtrados.length === 0 && (
        <p className="text-zinc-500">No encontramos insumos que coincidan con estos filtros.</p>
      )}

      <div className="flex flex-col gap-2">
        {filtrados.map((i) => {
          const estado = estadoInsumo(i)
          return (
            <Link
              key={i.id}
              href={`/insumos/${i.id}`}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-semibold text-zinc-800">{i.nombre}</p>
                <p className="text-sm text-zinc-500">
                  {formatCantidadUnidad(i.stock_actual, i.unidad_uso)} · {formatARS(i.costo_unitario_ponderado)}/
                  {i.unidad_uso}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estado.className}`}>
                {estado.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
