import { crearProducto } from '../actions'

export default function NuevoProductoPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-zinc-900">Nuevo producto</h1>
      <p className="text-sm text-zinc-500">
        Después de guardar vas a poder agregar los insumos de la receta.
      </p>

      <form action={crearProducto} className="flex flex-col gap-4">
        <Campo label="Nombre" name="nombre" required placeholder="Ej: Aros colgantes dorados" />
        <Campo
          label="Mano de obra ($ por unidad)"
          name="mano_obra_costo"
          type="number"
          step="any"
          defaultValue="0"
        />
        <Campo
          label="Otros costos ($ por unidad, ej: empaque)"
          name="otros_costos"
          type="number"
          step="any"
          defaultValue="0"
        />
        <Campo
          label="Margen de ganancia (%)"
          name="margen_pct"
          type="number"
          step="any"
          defaultValue="100"
        />

        <button
          type="submit"
          className="mt-2 rounded-lg bg-rose-800 px-4 py-3 text-base font-semibold text-white"
        >
          Guardar y agregar receta
        </button>
      </form>
    </div>
  )
}

function Campo({
  label,
  name,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        name={name}
        className="rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-rose-500 focus:outline-none"
        {...props}
      />
    </label>
  )
}
