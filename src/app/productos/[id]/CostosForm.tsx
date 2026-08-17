'use client'

import { useState } from 'react'
import { formatARS, formatNumero } from '@/lib/format'
import BotonGuardar from '@/components/BotonGuardar'
import Campo from '@/components/Campo'

type Props = {
  productoId: string
  costoMateriales: number
  nombre: string
  manoObraInicial: number
  otrosCostosInicial: number
  margenInicial: number
  precioFinalInicial: number | null
  action: (formData: FormData) => void
}

function num(v: string): number {
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export default function CostosForm({
  costoMateriales,
  nombre,
  manoObraInicial,
  otrosCostosInicial,
  margenInicial,
  precioFinalInicial,
  action,
}: Props) {
  const [manoObra, setManoObra] = useState(String(manoObraInicial))
  const [otrosCostos, setOtrosCostos] = useState(String(otrosCostosInicial))
  const [margen, setMargen] = useState(String(margenInicial))
  const [precioFinal, setPrecioFinal] = useState(precioFinalInicial != null ? String(precioFinalInicial) : '')

  const costoTotal = costoMateriales + num(manoObra) + num(otrosCostos)
  const precioSugerido = costoTotal * (1 + num(margen) / 100)
  const gananciaSugerida = precioSugerido - costoTotal

  const tienePrecioFinal = precioFinal.trim() !== ''
  const precioFinalNum = num(precioFinal)
  const gananciaFinal = precioFinalNum - costoTotal
  const margenFinalPct = costoTotal > 0 ? (gananciaFinal / costoTotal) * 100 : 0

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 rounded-lg bg-cantera-base p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-cantera-secondary">Costo total (materiales + mano de obra + otros)</span>
          <span className="font-semibold text-cantera-ink">{formatARS(costoTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-cantera-secondary">Precio sugerido (según margen)</span>
          <span className="font-semibold text-cantera-ink">{formatARS(precioSugerido)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-cantera-secondary">Ganancia con precio sugerido</span>
          <span className="font-semibold text-emerald-700">{formatARS(gananciaSugerida)}</span>
        </div>
        {tienePrecioFinal && (
          <>
            <div className="my-1 border-t border-cantera-sand" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-cantera-secondary">Ganancia con precio final</span>
              <span className="font-semibold text-emerald-700">{formatARS(gananciaFinal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-cantera-secondary">Margen real con precio final</span>
              <span className="font-semibold text-cantera-ink">{formatNumero(margenFinalPct, 1)}%</span>
            </div>
          </>
        )}
      </div>

      <Campo label="Nombre" name="nombre" defaultValue={nombre} required />
      <div className="grid grid-cols-2 gap-3">
        <Campo
          label="Mano de obra ($)"
          name="mano_obra_costo"
          type="number"
          step="any"
          value={manoObra}
          onChange={(e) => setManoObra(e.target.value)}
        />
        <Campo
          label="Otros costos ($)"
          name="otros_costos"
          type="number"
          step="any"
          value={otrosCostos}
          onChange={(e) => setOtrosCostos(e.target.value)}
        />
      </div>
      <Campo
        label="Margen de ganancia (%)"
        name="margen_pct"
        type="number"
        step="any"
        value={margen}
        onChange={(e) => setMargen(e.target.value)}
      />
      <Campo
        label="Precio final (opcional, redondeado a mano)"
        name="precio_final"
        type="number"
        step="any"
        value={precioFinal}
        onChange={(e) => setPrecioFinal(e.target.value)}
        hint="Si lo dejás vacío se usa el precio sugerido"
      />
      <BotonGuardar />
    </form>
  )
}
