'use client'

import { useMemo, useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { unstable_rethrow } from 'next/navigation'
import { producirVarios } from './actions'

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

type Producto = { id: string; nombre: string }
type ItemCarrito = { productoId: string; nombre: string; cantidad: number }

export default function ProducirForm({ productos }: { productos: Producto[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null)
  const [carrito, setCarrito] = useState<ItemCarrito[]>([])
  const [confirmando, startConfirmar] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    const enCarrito = new Set(carrito.map((c) => c.productoId))
    const q = normalizar(busqueda.trim())
    return productos.filter((p) => !enCarrito.has(p.id) && (!q || normalizar(p.nombre).includes(q)))
  }, [productos, busqueda, carrito])

  function agregarAlCarrito(cantidad: number) {
    if (!seleccionado || cantidad <= 0) return
    setCarrito((prev) => [...prev, { productoId: seleccionado.id, nombre: seleccionado.nombre, cantidad }])
    setSeleccionado(null)
    setBusqueda('')
  }

  function quitarDelCarrito(productoId: string) {
    setCarrito((prev) => prev.filter((c) => c.productoId !== productoId))
  }

  function cambiarCantidad(productoId: string, cantidad: number) {
    setCarrito((prev) => prev.map((c) => (c.productoId === productoId ? { ...c, cantidad } : c)))
  }

  function confirmar() {
    setError(null)
    startConfirmar(async () => {
      try {
        await producirVarios(carrito.map((c) => ({ productoId: c.productoId, cantidad: c.cantidad })))
      } catch (e) {
        unstable_rethrow(e)
        setError(e instanceof Error ? e.message : 'No se pudo registrar la producción')
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {carrito.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4">
          {carrito.map((c) => (
            <div key={c.productoId} className="flex items-center gap-3">
              <span className="flex-1 text-sm font-medium text-zinc-800">{c.nombre}</span>
              <input
                type="number"
                min="1"
                step="1"
                value={c.cantidad}
                onChange={(e) => cambiarCantidad(c.productoId, Number(e.target.value) || 1)}
                className="w-20 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-rose-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => quitarDelCarrito(c.productoId)}
                className="text-zinc-400 hover:text-red-600"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        {!seleccionado ? (
          <>
            <label className="relative flex items-center">
              <Search size={18} className="pointer-events-none absolute left-3 text-zinc-400" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto para agregar..."
                className="w-full rounded-lg border border-zinc-300 py-3 pl-10 pr-4 text-base focus:border-rose-500 focus:outline-none"
              />
            </label>

            {busqueda.trim() !== '' && (
              <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                {filtrados.length === 0 && <p className="p-2 text-sm text-zinc-500">No encontramos productos.</p>}
                {filtrados.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSeleccionado(p)}
                    className="rounded-lg px-3 py-3 text-left text-base hover:bg-rose-50"
                  >
                    {p.nombre}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              agregarAlCarrito(Number(formData.get('cantidad')) || 1)
            }}
            className="flex items-end gap-3"
          >
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
            <label className="flex w-24 flex-col gap-1.5">
              <span className="text-sm font-medium text-zinc-700">Cantidad</span>
              <input
                name="cantidad"
                type="number"
                min="1"
                step="1"
                required
                autoFocus
                defaultValue={1}
                className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base focus:border-rose-500 focus:outline-none"
              />
            </label>
            <button type="submit" className="rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-white">
              Agregar
            </button>
          </form>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {carrito.length > 0 && (
        <button
          type="button"
          disabled={confirmando}
          onClick={confirmar}
          className="rounded-lg bg-rose-800 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
        >
          {confirmando ? 'Registrando...' : `Confirmar producción (${carrito.length})`}
        </button>
      )}
    </div>
  )
}
