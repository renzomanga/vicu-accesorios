'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ItemConfirmado = {
  nombre: string
  precio_unitario: number
  cantidad: number
  subtotal_linea: number
  insumo_id: string | null // null => crear insumo nuevo
  insumo_nuevo?: { unidad_compra: string; unidad_uso: string; factor_conversion: number }
}

export type OrdenConfirmadaPayload = {
  proveedor_nombre: string
  numero_orden: string | null
  fecha: string | null
  subtotal: number
  descuento: number
  costo_envio: number
  total: number
  capturas_urls: string[]
  items: ItemConfirmado[]
}

export async function confirmarOrden(payload: OrdenConfirmadaPayload) {
  const supabase = await createClient()

  let proveedorId: string
  const nombreProveedor = payload.proveedor_nombre.trim() || 'Sin nombre'
  const { data: proveedorExistente } = await supabase
    .from('proveedores')
    .select('id')
    .ilike('nombre', nombreProveedor)
    .maybeSingle()

  if (proveedorExistente) {
    proveedorId = proveedorExistente.id
  } else {
    const { data: nuevoProveedor, error } = await supabase
      .from('proveedores')
      .insert({ nombre: nombreProveedor })
      .select('id')
      .single()
    if (error || !nuevoProveedor) throw new Error(error?.message || 'No se pudo crear el proveedor')
    proveedorId = nuevoProveedor.id
  }

  const { data: orden, error: errOrden } = await supabase
    .from('ordenes_compra')
    .insert({
      proveedor_id: proveedorId,
      numero_orden: payload.numero_orden,
      fecha: payload.fecha,
      subtotal: payload.subtotal,
      descuento: payload.descuento,
      costo_envio: payload.costo_envio,
      total: payload.total,
      capturas_urls: payload.capturas_urls,
      estado: 'confirmada',
    })
    .select('id')
    .single()
  if (errOrden || !orden) throw new Error(errOrden?.message || 'No se pudo crear la orden')

  const subtotalTotal = payload.subtotal || payload.items.reduce((a, i) => a + i.subtotal_linea, 0)

  for (const item of payload.items) {
    let insumoId = item.insumo_id
    let factorConversion: number
    let stockActual: number
    let costoActual: number

    if (insumoId) {
      const { data: insumo, error } = await supabase
        .from('insumos')
        .select('factor_conversion, stock_actual, costo_unitario_ponderado')
        .eq('id', insumoId)
        .single()
      if (error || !insumo) throw new Error(error?.message || 'Insumo no encontrado')
      factorConversion = insumo.factor_conversion
      stockActual = insumo.stock_actual
      costoActual = insumo.costo_unitario_ponderado
    } else {
      const nuevo = item.insumo_nuevo
      if (!nuevo) throw new Error(`Falta la unidad de compra/uso para "${item.nombre}"`)
      factorConversion = nuevo.factor_conversion || 1
      stockActual = 0
      costoActual = 0

      const { data: insumoCreado, error } = await supabase
        .from('insumos')
        .insert({
          nombre: item.nombre,
          unidad_compra: nuevo.unidad_compra,
          unidad_uso: nuevo.unidad_uso,
          factor_conversion: factorConversion,
          stock_actual: 0,
          stock_minimo: 0,
          costo_unitario_ponderado: 0,
        })
        .select('id')
        .single()
      if (error || !insumoCreado) throw new Error(error?.message || 'No se pudo crear el insumo')
      insumoId = insumoCreado.id
    }

    const peso = subtotalTotal > 0 ? item.subtotal_linea / subtotalTotal : 1 / payload.items.length
    const envioProrrateado = payload.costo_envio * peso
    const descuentoProrrateado = payload.descuento * peso
    const costoTotalLinea = item.subtotal_linea + envioProrrateado - descuentoProrrateado
    const cantidadUso = item.cantidad * factorConversion
    const costoUnitarioFinal = cantidadUso > 0 ? costoTotalLinea / cantidadUso : 0

    const { data: ordenItem, error: errItem } = await supabase
      .from('orden_items')
      .insert({
        orden_compra_id: orden.id,
        insumo_id: insumoId,
        nombre_crudo: item.nombre,
        precio_unitario: item.precio_unitario,
        cantidad: item.cantidad,
        subtotal_linea: item.subtotal_linea,
        envio_prorrateado: envioProrrateado,
        descuento_prorrateado: descuentoProrrateado,
        costo_total_linea: costoTotalLinea,
        costo_unitario_final: costoUnitarioFinal,
      })
      .select('id')
      .single()
    if (errItem || !ordenItem) throw new Error(errItem?.message || 'No se pudo guardar la línea')

    const nuevoStock = stockActual + cantidadUso
    const nuevoCosto =
      nuevoStock > 0 ? (stockActual * costoActual + cantidadUso * costoUnitarioFinal) / nuevoStock : 0

    await supabase
      .from('insumos')
      .update({
        stock_actual: nuevoStock,
        costo_unitario_ponderado: nuevoCosto,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', insumoId)

    await supabase.from('movimientos_stock').insert({
      insumo_id: insumoId,
      tipo: 'compra',
      cantidad: cantidadUso,
      referencia: ordenItem.id,
    })
  }

  revalidatePath('/ordenes')
  revalidatePath('/insumos')
  revalidatePath('/')
  redirect('/ordenes')
}
