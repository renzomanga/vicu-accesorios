-- Cantera Joyas — esquema de base de datos
-- Correr en el SQL Editor de Supabase (proyecto nuevo)

create extension if not exists "pgcrypto";

-- ============ proveedores ============
create table proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  notas text,
  creado_en timestamptz not null default now()
);

-- ============ insumos (maestro de materiales) ============
create table insumos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  sku text,
  unidad_compra text not null,       -- ej: "tira", "paquete x20", "gramo", "unidad"
  unidad_uso text not null,          -- ej: "unidad", "gramo"
  factor_conversion numeric not null default 1, -- cuántas unidades_uso salen de 1 unidad_compra
  stock_actual numeric not null default 0,       -- en unidad_uso
  stock_minimo numeric not null default 0,
  costo_unitario_ponderado numeric not null default 0, -- en unidad_uso
  actualizado_en timestamptz not null default now(),
  creado_en timestamptz not null default now()
);

-- ============ ordenes_compra ============
create table ordenes_compra (
  id uuid primary key default gen_random_uuid(),
  proveedor_id uuid references proveedores(id),
  numero_orden text,
  fecha date,
  subtotal numeric not null default 0,
  descuento numeric not null default 0,
  costo_envio numeric not null default 0,
  total numeric not null default 0,
  capturas_urls text[] not null default '{}',
  estado text not null default 'borrador', -- borrador | confirmada
  creado_en timestamptz not null default now()
);

-- ============ orden_items (líneas de cada orden, tal como vienen del proveedor) ============
create table orden_items (
  id uuid primary key default gen_random_uuid(),
  orden_compra_id uuid not null references ordenes_compra(id) on delete cascade,
  insumo_id uuid references insumos(id), -- null hasta matchear/crear insumo
  nombre_crudo text not null,
  precio_unitario numeric not null default 0,
  cantidad numeric not null default 1,
  subtotal_linea numeric not null default 0,
  envio_prorrateado numeric not null default 0,
  descuento_prorrateado numeric not null default 0,
  costo_total_linea numeric not null default 0,
  costo_unitario_final numeric not null default 0
);

-- ============ movimientos_stock (historial de entradas/salidas) ============
create table movimientos_stock (
  id uuid primary key default gen_random_uuid(),
  insumo_id uuid not null references insumos(id),
  tipo text not null check (tipo in ('compra', 'consumo_produccion', 'ajuste_manual')),
  cantidad numeric not null, -- positivo = entrada, negativo = salida (en unidad_uso)
  referencia uuid, -- orden_item_id o produccion_id, según tipo
  fecha timestamptz not null default now()
);

-- ============ productos_terminados ============
create table productos_terminados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  foto_url text,
  mano_obra_costo numeric not null default 0,
  otros_costos numeric not null default 0,
  margen_pct numeric not null default 0,
  precio_sugerido numeric not null default 0,
  precio_final numeric,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- ============ recetas (bill of materials de cada producto) ============
create table recetas (
  id uuid primary key default gen_random_uuid(),
  producto_terminado_id uuid not null references productos_terminados(id) on delete cascade,
  insumo_id uuid not null references insumos(id),
  cantidad_usada numeric not null default 0 -- en unidad_uso
);

-- ============ producciones (cada vez que arma unidades de un producto) ============
create table producciones (
  id uuid primary key default gen_random_uuid(),
  producto_terminado_id uuid not null references productos_terminados(id),
  cantidad_producida numeric not null,
  fecha timestamptz not null default now(),
  costo_total_snapshot numeric not null default 0
);

-- índices útiles
create index idx_orden_items_orden on orden_items(orden_compra_id);
create index idx_orden_items_insumo on orden_items(insumo_id);
create index idx_movimientos_insumo on movimientos_stock(insumo_id);
create index idx_recetas_producto on recetas(producto_terminado_id);

-- Row Level Security: por ahora, cualquier usuario autenticado (Vicu y Renzo) puede
-- leer/escribir todo. No hay roles distintos entre ellos (ver plan, sección 2).
alter table proveedores enable row level security;
alter table insumos enable row level security;
alter table ordenes_compra enable row level security;
alter table orden_items enable row level security;
alter table movimientos_stock enable row level security;
alter table productos_terminados enable row level security;
alter table recetas enable row level security;
alter table producciones enable row level security;

create policy "authenticated_full_access" on proveedores for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on insumos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on ordenes_compra for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on orden_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on movimientos_stock for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on productos_terminados for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on recetas for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated_full_access" on producciones for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage bucket para las capturas de órdenes de compra
insert into storage.buckets (id, name, public) values ('capturas-ordenes', 'capturas-ordenes', false)
on conflict (id) do nothing;

create policy "authenticated_read_capturas" on storage.objects for select using (bucket_id = 'capturas-ordenes' and auth.role() = 'authenticated');
create policy "authenticated_write_capturas" on storage.objects for insert with check (bucket_id = 'capturas-ordenes' and auth.role() = 'authenticated');
