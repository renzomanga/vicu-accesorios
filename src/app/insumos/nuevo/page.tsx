import { crearInsumo } from '../actions'

export default function NuevoInsumoPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-zinc-900">Nuevo insumo</h1>

      <form action={crearInsumo} className="flex flex-col gap-4">
        <Campo label="Nombre" name="nombre" required placeholder="Ej: Cadena fina dorada" />
        <Campo label="SKU / código (opcional)" name="sku" />

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Unidad de compra" name="unidad_compra" required placeholder="Ej: tira" />
          <Campo label="Unidad de uso" name="unidad_uso" required placeholder="Ej: unidad" />
        </div>

        <Campo
          label="Factor de conversión"
          name="factor_conversion"
          type="number"
          step="any"
          defaultValue="1"
          hint="Cuántas unidades de uso salen de 1 unidad de compra (ej: 1 tira = 20 unidades)"
        />

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Stock inicial" name="stock_actual" type="number" step="any" defaultValue="0" />
          <Campo label="Stock mínimo" name="stock_minimo" type="number" step="any" defaultValue="0" />
        </div>

        <Campo
          label="Costo por unidad de uso ($)"
          name="costo_unitario_ponderado"
          type="number"
          step="any"
          defaultValue="0"
        />

        <button
          type="submit"
          className="mt-2 rounded-lg bg-rose-800 px-4 py-3 text-base font-semibold text-white"
        >
          Guardar insumo
        </button>
      </form>
    </div>
  )
}

function Campo({
  label,
  name,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        name={name}
        className="rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-rose-500 focus:outline-none"
        {...props}
      />
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </label>
  )
}
