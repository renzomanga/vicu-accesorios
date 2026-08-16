'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function num(formData: FormData, key: string): number {
  const v = Number(String(formData.get(key) ?? '0').replace(',', '.'))
  return Number.isFinite(v) ? v : 0
}

export async function crearInsumo(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('insumos').insert({
    nombre: String(formData.get('nombre') || '').trim(),
    sku: String(formData.get('sku') || '').trim() || null,
    unidad_compra: String(formData.get('unidad_compra') || '').trim(),
    unidad_uso: String(formData.get('unidad_uso') || '').trim(),
    factor_conversion: num(formData, 'factor_conversion') || 1,
    stock_actual: num(formData, 'stock_actual'),
    stock_minimo: num(formData, 'stock_minimo'),
    costo_unitario_ponderado: num(formData, 'costo_unitario_ponderado'),
  })

  if (error) throw new Error(error.message)

  revalidatePath('/insumos')
  revalidatePath('/')
  redirect('/insumos')
}

export async function actualizarInsumo(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('insumos')
    .update({
      nombre: String(formData.get('nombre') || '').trim(),
      sku: String(formData.get('sku') || '').trim() || null,
      unidad_compra: String(formData.get('unidad_compra') || '').trim(),
      unidad_uso: String(formData.get('unidad_uso') || '').trim(),
      factor_conversion: num(formData, 'factor_conversion') || 1,
      stock_minimo: num(formData, 'stock_minimo'),
      costo_unitario_ponderado: num(formData, 'costo_unitario_ponderado'),
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/insumos')
  revalidatePath(`/insumos/${id}`)
  redirect('/insumos')
}

export async function ajustarStock(id: string, formData: FormData) {
  const supabase = await createClient()
  const cantidad = num(formData, 'cantidad')

  const { data: insumo, error: errInsumo } = await supabase
    .from('insumos')
    .select('stock_actual')
    .eq('id', id)
    .single()
  if (errInsumo || !insumo) throw new Error(errInsumo?.message || 'Insumo no encontrado')

  const nuevoStock = insumo.stock_actual + cantidad

  const { error: errUpdate } = await supabase
    .from('insumos')
    .update({ stock_actual: nuevoStock, actualizado_en: new Date().toISOString() })
    .eq('id', id)
  if (errUpdate) throw new Error(errUpdate.message)

  const { error: errMov } = await supabase.from('movimientos_stock').insert({
    insumo_id: id,
    tipo: 'ajuste_manual',
    cantidad,
  })
  if (errMov) throw new Error(errMov.message)

  revalidatePath('/insumos')
  revalidatePath(`/insumos/${id}`)
  revalidatePath('/')
}
