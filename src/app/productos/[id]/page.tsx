import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatARS } from '@/lib/format'
import { actualizarCostosProducto, agregarInsumoReceta, eliminarProducto } from '../actions'
import AgregarInsumoForm from './AgregarInsumoForm'
import CostosForm from './CostosForm'
import RecetaList from './RecetaList'
import EliminarProductoBoton from './EliminarProductoBoton'

export default async function ProductoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: producto } = await supabase
    .from('productos_terminados')
    .select('*')
    .eq('id', id)
    .single()
  if (!producto) notFound()

  const { data: recetaRaw } = await supabase
    .from('recetas')
    .select('id, cantidad_usada, insumos(id, nombre, unidad_uso, costo_unitario_ponderado)')
    .eq('producto_terminado_id', id)

  type RecetaConInsumo = {
    id: string
    cantidad_usada: number
    insumos: { id: string; nombre: string; unidad_uso: string; costo_unitario_ponderado: number } | null
  }
  const receta = (recetaRaw ?? []) as unknown as RecetaConInsumo[]

  const { data: insumos } = await supabase.from('insumos').select('id, nombre, unidad_uso').order('nombre')

  const costoMateriales = receta.reduce(
    (acc, r) => acc + r.cantidad_usada * (r.insumos?.costo_unitario_ponderado ?? 0),
    0
  )

  const actualizarConId = actualizarCostosProducto.bind(null, id)
  const agregarConId = agregarInsumoReceta.bind(null, id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-caslon text-2xl text-cantera-ink">{producto.nombre}</h1>
        <p className="text-2xl font-bold text-cantera-primary">
          {formatARS(producto.precio_final ?? producto.precio_sugerido)}
        </p>
        <p className="text-sm text-cantera-secondary">
          Sugerido: {formatARS(producto.precio_sugerido)} · Costo materiales: {formatARS(costoMateriales)}
        </p>
      </div>

      <section className="rounded-xl border border-cantera-sand bg-white p-4">
        <h2 className="mb-3 font-semibold text-cantera-ink">Receta</h2>

        {receta.length === 0 ? (
          <p className="mb-3 text-sm text-cantera-secondary">Todavía no agregaste insumos.</p>
        ) : (
          <RecetaList receta={receta} productoId={id} />
        )}

        <AgregarInsumoForm insumos={insumos ?? []} action={agregarConId} />
      </section>

      <section className="rounded-xl border border-cantera-sand bg-white p-4">
        <h2 className="mb-3 font-semibold text-cantera-ink">Costos y precio</h2>
        <CostosForm
          productoId={id}
          costoMateriales={costoMateriales}
          nombre={producto.nombre}
          manoObraInicial={producto.mano_obra_costo}
          otrosCostosInicial={producto.otros_costos}
          margenInicial={producto.margen_pct}
          precioFinalInicial={producto.precio_final}
          action={actualizarConId}
        />
      </section>

      <div className="flex justify-center">
        <EliminarProductoBoton nombre={producto.nombre} action={eliminarProducto.bind(null, id)} />
      </div>
    </div>
  )
}
