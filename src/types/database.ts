// Tipos de la base de datos, a mano (ver supabase/schema.sql).
// Cuando el proyecto Supabase esté creado, se puede regenerar con:
// npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type Proveedor = {
  id: string
  nombre: string
  notas: string | null
  creado_en: string
}

export type Insumo = {
  id: string
  nombre: string
  sku: string | null
  unidad_compra: string
  unidad_uso: string
  factor_conversion: number
  stock_actual: number
  stock_minimo: number
  costo_unitario_ponderado: number
  actualizado_en: string
  creado_en: string
}

export type OrdenCompra = {
  id: string
  proveedor_id: string | null
  numero_orden: string | null
  fecha: string | null
  subtotal: number
  descuento: number
  costo_envio: number
  total: number
  capturas_urls: string[]
  estado: 'borrador' | 'confirmada'
  creado_en: string
}

export type OrdenItem = {
  id: string
  orden_compra_id: string
  insumo_id: string | null
  nombre_crudo: string
  precio_unitario: number
  cantidad: number
  subtotal_linea: number
  envio_prorrateado: number
  descuento_prorrateado: number
  costo_total_linea: number
  costo_unitario_final: number
}

export type MovimientoStock = {
  id: string
  insumo_id: string
  tipo: 'compra' | 'consumo_produccion' | 'ajuste_manual'
  cantidad: number
  referencia: string | null
  fecha: string
}

export type ProductoTerminado = {
  id: string
  nombre: string
  foto_url: string | null
  mano_obra_costo: number
  otros_costos: number
  margen_pct: number
  precio_sugerido: number
  precio_final: number | null
  activo: boolean
  creado_en: string
}

export type Receta = {
  id: string
  producto_terminado_id: string
  insumo_id: string
  cantidad_usada: number
}

export type Produccion = {
  id: string
  producto_terminado_id: string
  cantidad_producida: number
  fecha: string
  costo_total_snapshot: number
}

type Tabla<Row, Insert> = { Row: Row; Insert: Insert; Update: Partial<Insert>; Relationships: [] }

export type Database = {
  public: {
    Tables: {
      proveedores: Tabla<Proveedor, Partial<Proveedor>>
      insumos: Tabla<Insumo, Partial<Insumo>>
      ordenes_compra: Tabla<OrdenCompra, Partial<OrdenCompra>>
      orden_items: Tabla<OrdenItem, Partial<OrdenItem>>
      movimientos_stock: Tabla<MovimientoStock, Partial<MovimientoStock>>
      productos_terminados: Tabla<ProductoTerminado, Partial<ProductoTerminado>>
      recetas: Tabla<Receta, Partial<Receta>>
      producciones: Tabla<Produccion, Partial<Produccion>>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
