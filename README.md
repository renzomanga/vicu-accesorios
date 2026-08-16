# Vicu Accesorios — App de Costos y Precios

App mobile-first (PWA) para gestionar insumos, recetas, stock y precios de venta de Vicu Accesorios.

## Stack

- Next.js (App Router) + Tailwind CSS, como PWA instalable
- Supabase (Postgres + Auth por magic link + Storage)
- Gemini API (visión) para extraer datos estructurados de capturas de órdenes de compra

## Setup local

1. Copiá `.env.local.example` a `.env.local` y completá las claves:
   - Creá un proyecto gratis en [supabase.com](https://supabase.com) y copiá `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API).
   - Corré el contenido de `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase para crear las tablas.
   - Conseguí una API key de Gemini en [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) y ponela en `GEMINI_API_KEY`.
2. Instalá dependencias y corré el servidor:

```bash
npm install
npm run dev
```

3. Abrí [http://localhost:3000](http://localhost:3000).

## Estructura

- `src/app` — rutas (App Router)
- `src/lib/supabase.ts` — clientes de Supabase (browser/server)
- `src/lib/gemini.ts` — extracción de órdenes de compra desde capturas con Gemini
- `supabase/schema.sql` — esquema de base de datos
