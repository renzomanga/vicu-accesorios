'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function num(formData: FormData, key: string): number {
  const v = Number(String(formData.get(key) ?? '0').replace(',', '.'))
  return Number.isFinite(v) ? v : 0
}

async function recalcularPrecio(productoId: string) {
  const supabase = await createClient()

  const { data: producto } = await supabase
    .from('productos_terminados')
    .select('mano_obra_costo, otros_costos, margen_pct')
    .eq('id', productoId)
    .single()
  if (!producto) return

  const { data: recetaRaw } = await supabase
    .from('recetas')
    .select('cantidad_usada, insumos(costo_unitario_ponderado)')
    .eq('producto_terminado_id', productoId)

  type RecetaConCosto = { cantidad_usada: number; insumos: { costo_unitario_ponderado: number } | null }
  const receta = (recetaRaw ?? []) as unknown as RecetaConCosto[]

  const costoMateriales = receta.reduce((acc, r) => {
    return acc + r.cantidad_usada * (r.insumos?.costo_unitario_ponderado ?? 0)
  }, 0)

  const costoTotal = costoMateriales + producto.mano_obra_costo + producto.otros_costos
  const precioSugerido = costoTotal * (1 + producto.margen_pct / 100)

  await supabase
    .from('productos_terminados')
    .update({ precio_sugerido: precioSugerido })
    .eq('id', productoId)
}

export async function crearProducto(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('productos_terminados')
    .insert({
      nombre: String(formData.get('nombre') || '').trim(),
      mano_obra_costo: num(formData, 'mano_obra_costo'),
      otros_costos: num(formData, 'otros_costos'),
      margen_pct: num(formData, 'margen_pct'),
    })
    .select('id')
    .single()

  if (error || !data) throw new Error(error?.message || 'No se pudo crear el producto')

  revalidatePath('/productos')
  redirect(`/productos/${data.id}`)
}

export async function actualizarCostosProducto(productoId: string, formData: FormData) {
  const supabase = await createClient()

  const precioFinalRaw = String(formData.get('precio_final') || '').trim()

  const { error } = await supabase
    .from('productos_terminados')
    .update({
      nombre: String(formData.get('nombre') || '').trim(),
      mano_obra_costo: num(formData, 'mano_obra_costo'),
      otros_costos: num(formData, 'otros_costos'),
      margen_pct: num(formData, 'margen_pct'),
      precio_final: precioFinalRaw ? num(formData, 'precio_final') : null,
    })
    .eq('id', productoId)

  if (error) throw new Error(error.message)

  await recalcularPrecio(productoId)

  revalidatePath('/productos')
  revalidatePath(`/productos/${productoId}`)
}

export async function agregarInsumoReceta(productoId: string, formData: FormData) {
  const supabase = await createClient()

  const insumoId = String(formData.get('insumo_id') || '')
  const cantidad = num(formData, 'cantidad_usada')
  if (!insumoId || cantidad <= 0) return

  const { error } = await supabase.from('recetas').insert({
    producto_terminado_id: productoId,
    insumo_id: insumoId,
    cantidad_usada: cantidad,
  })
  if (error) throw new Error(error.message)

  await recalcularPrecio(productoId)
  revalidatePath(`/productos/${productoId}`)
  revalidatePath('/productos')
}

export async function quitarInsumoReceta(recetaId: string, productoId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('recetas').delete().eq('id', recetaId)
  if (error) throw new Error(error.message)

  await recalcularPrecio(productoId)
  revalidatePath(`/productos/${productoId}`)
  revalidatePath('/productos')
}
