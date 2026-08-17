'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ItemProduccion = { productoId: string; cantidad: number }

export async function producirVarios(items: ItemProduccion[]) {
  const validos = items.filter((i) => i.productoId && i.cantidad > 0)
  if (validos.length === 0) throw new Error('Agregá al menos un producto con cantidad válida')

  const supabase = await createClient()

  for (const { productoId, cantidad } of validos) {
    const { data: producto, error: errProducto } = await supabase
      .from('productos_terminados')
      .select('mano_obra_costo, otros_costos')
      .eq('id', productoId)
      .single()
    if (errProducto || !producto) throw new Error('Producto no encontrado')

    const { data: recetaRaw, error: errReceta } = await supabase
      .from('recetas')
      .select('insumo_id, cantidad_usada, insumos(stock_actual, costo_unitario_ponderado)')
      .eq('producto_terminado_id', productoId)
    if (errReceta) throw new Error(errReceta.message)

    type RecetaConInsumo = {
      insumo_id: string
      cantidad_usada: number
      insumos: { stock_actual: number; costo_unitario_ponderado: number } | null
    }
    const receta = (recetaRaw ?? []) as unknown as RecetaConInsumo[]

    let costoMateriales = 0
    for (const item of receta) {
      const consumo = item.cantidad_usada * cantidad
      costoMateriales += consumo * (item.insumos?.costo_unitario_ponderado ?? 0)
    }
    const costoTotalSnapshot = costoMateriales + (producto.mano_obra_costo + producto.otros_costos) * cantidad

    const { data: produccion, error: errProduccion } = await supabase
      .from('producciones')
      .insert({
        producto_terminado_id: productoId,
        cantidad_producida: cantidad,
        costo_total_snapshot: costoTotalSnapshot,
      })
      .select('id')
      .single()
    if (errProduccion || !produccion)
      throw new Error(errProduccion?.message || 'No se pudo registrar la producción')

    for (const item of receta) {
      const consumo = item.cantidad_usada * cantidad
      const nuevoStock = (item.insumos?.stock_actual ?? 0) - consumo

      await supabase.from('insumos').update({ stock_actual: nuevoStock }).eq('id', item.insumo_id)
      await supabase.from('movimientos_stock').insert({
        insumo_id: item.insumo_id,
        tipo: 'consumo_produccion',
        cantidad: -consumo,
        referencia: produccion.id,
      })
    }
  }

  revalidatePath('/')
  revalidatePath('/insumos')
  revalidatePath('/producir')
  redirect('/producir?ok=1')
}
