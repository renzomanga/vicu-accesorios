'use client'

import { useState, useTransition } from 'react'
import { extraerCapturasAction } from '../gemini-action'
import { confirmarOrden, type ItemConfirmado } from '../actions'
import type { OrdenExtraida } from '@/lib/gemini'

type InsumoExistente = { id: string; nombre: string; unidad_uso: string }

type ItemEditable = {
  nombre: string
  precio_unitario: number
  cantidad: number
  subtotal_linea: number
  insumoId: string // '' = crear nuevo
  unidadCompra: string
  unidadUso: string
  factorConversion: number
}

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

function mejorMatch(nombre: string, insumos: InsumoExistente[]): InsumoExistente | null {
  const n = normalizar(nombre)
  if (!n) return null
  let mejor: InsumoExistente | null = null
  for (const insumo of insumos) {
    const i = normalizar(insumo.nombre)
    if (i === n) return insumo
    if ((i.includes(n) || n.includes(i)) && n.length > 2) {
      mejor = insumo
    }
  }
  return mejor
}

function itemsDesdeExtraccion(extraida: OrdenExtraida, insumos: InsumoExistente[]): ItemEditable[] {
  return extraida.items.map((item) => {
    const match = mejorMatch(item.nombre, insumos)
    return {
      nombre: item.nombre,
      precio_unitario: item.precio_unitario,
      cantidad: item.cantidad,
      subtotal_linea: item.subtotal_linea ?? item.precio_unitario * item.cantidad,
      insumoId: match?.id ?? '',
      unidadCompra: 'unidad',
      unidadUso: 'unidad',
      factorConversion: 1,
    }
  })
}

export default function OrdenNuevaForm({ insumosExistentes }: { insumosExistentes: InsumoExistente[] }) {
  const [archivos, setArchivos] = useState<File[]>([])
  const [extrayendo, setExtrayendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmando, startConfirmar] = useTransition()

  const [proveedor, setProveedor] = useState('')
  const [numeroOrden, setNumeroOrden] = useState('')
  const [fecha, setFecha] = useState('')
  const [subtotal, setSubtotal] = useState(0)
  const [descuento, setDescuento] = useState(0)
  const [costoEnvio, setCostoEnvio] = useState(0)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<ItemEditable[] | null>(null)

  async function extraer() {
    setError(null)
    setExtrayendo(true)
    try {
      const formData = new FormData()
      archivos.forEach((f) => formData.append('imagenes', f))
      const extraida = await extraerCapturasAction(formData)

      setProveedor(extraida.proveedor || '')
      setNumeroOrden(extraida.numero_orden || '')
      setFecha(extraida.fecha || '')
      setSubtotal(extraida.subtotal ?? extraida.items.reduce((a, i) => a + i.precio_unitario * i.cantidad, 0))
      setDescuento(extraida.descuento ?? 0)
      setCostoEnvio(extraida.costo_envio ?? 0)
      setTotal(extraida.total ?? 0)
      setItems(itemsDesdeExtraccion(extraida, insumosExistentes))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al procesar las imágenes')
    } finally {
      setExtrayendo(false)
    }
  }

  function actualizarItem(idx: number, cambios: Partial<ItemEditable>) {
    setItems((prev) => (prev ? prev.map((it, i) => (i === idx ? { ...it, ...cambios } : it)) : prev))
  }

  function confirmar() {
    if (!items) return
    setError(null)

    const itemsConfirmados: ItemConfirmado[] = items.map((it) => ({
      nombre: it.nombre,
      precio_unitario: it.precio_unitario,
      cantidad: it.cantidad,
      subtotal_linea: it.subtotal_linea,
      insumo_id: it.insumoId || null,
      insumo_nuevo: it.insumoId
        ? undefined
        : {
            unidad_compra: it.unidadCompra,
            unidad_uso: it.unidadUso,
            factor_conversion: it.factorConversion,
          },
    }))

    startConfirmar(async () => {
      try {
        await confirmarOrden({
          proveedor_nombre: proveedor,
          numero_orden: numeroOrden || null,
          fecha: fecha || null,
          subtotal,
          descuento,
          costo_envio: costoEnvio,
          total,
          capturas_urls: [],
          items: itemsConfirmados,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo guardar la orden')
      }
    })
  }

  if (!items) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700">Capturas de la orden</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setArchivos(Array.from(e.target.files ?? []))}
            className="rounded-lg border border-zinc-300 px-3 py-3 text-sm"
          />
        </label>
        {archivos.length > 0 && (
          <p className="text-sm text-zinc-500">{archivos.length} imagen(es) seleccionada(s)</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          disabled={archivos.length === 0 || extrayendo}
          onClick={extraer}
          className="rounded-lg bg-rose-800 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
        >
          {extrayendo ? 'Leyendo la orden con IA...' : 'Extraer datos con IA'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Revisá los datos antes de confirmar. Nada se guarda hasta que apretás &quot;Confirmar&quot;.
      </p>

      <section className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <CampoTexto label="Proveedor" value={proveedor} onChange={setProveedor} />
        <CampoTexto label="N° de orden" value={numeroOrden} onChange={setNumeroOrden} />
        <CampoTexto label="Fecha" value={fecha} onChange={setFecha} type="date" />
        <CampoNumero label="Subtotal" value={subtotal} onChange={setSubtotal} />
        <CampoNumero label="Descuento" value={descuento} onChange={setDescuento} />
        <CampoNumero label="Costo de envío" value={costoEnvio} onChange={setCostoEnvio} />
        <CampoNumero label="Total" value={total} onChange={setTotal} />
      </section>

      <section className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4">
            <CampoTexto label="Insumo" value={item.nombre} onChange={(v) => actualizarItem(idx, { nombre: v })} />
            <div className="grid grid-cols-2 gap-3">
              <CampoNumero
                label="Precio unitario"
                value={item.precio_unitario}
                onChange={(v) => actualizarItem(idx, { precio_unitario: v })}
              />
              <CampoNumero
                label="Cantidad"
                value={item.cantidad}
                onChange={(v) => actualizarItem(idx, { cantidad: v })}
              />
            </div>
            <CampoNumero
              label="Subtotal de la línea"
              value={item.subtotal_linea}
              onChange={(v) => actualizarItem(idx, { subtotal_linea: v })}
            />

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-zinc-700">Matchea con</span>
              <select
                value={item.insumoId}
                onChange={(e) => actualizarItem(idx, { insumoId: e.target.value })}
                className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base focus:border-rose-500 focus:outline-none"
              >
                <option value="">+ Crear insumo nuevo</option>
                {insumosExistentes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre}
                  </option>
                ))}
              </select>
            </label>

            {!item.insumoId && (
              <div className="grid grid-cols-3 gap-3 rounded-lg bg-zinc-50 p-3">
                <CampoTexto
                  label="Unidad de compra"
                  value={item.unidadCompra}
                  onChange={(v) => actualizarItem(idx, { unidadCompra: v })}
                />
                <CampoTexto
                  label="Unidad de uso"
                  value={item.unidadUso}
                  onChange={(v) => actualizarItem(idx, { unidadUso: v })}
                />
                <CampoNumero
                  label="Factor conversión"
                  value={item.factorConversion}
                  onChange={(v) => actualizarItem(idx, { factorConversion: v })}
                />
              </div>
            )}
          </div>
        ))}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={confirmando}
        onClick={confirmar}
        className="rounded-lg bg-rose-800 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
      >
        {confirmando ? 'Guardando...' : 'Confirmar y guardar orden'}
      </button>
    </div>
  )
}

function CampoTexto({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base focus:border-rose-500 focus:outline-none"
      />
    </label>
  )
}

function CampoNumero({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="rounded-lg border border-zinc-300 px-3 py-2.5 text-base focus:border-rose-500 focus:outline-none"
      />
    </label>
  )
}
