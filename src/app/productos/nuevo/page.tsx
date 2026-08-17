import { crearProducto } from '../actions'
import BotonGuardar from '@/components/BotonGuardar'
import Campo from '@/components/Campo'

export default function NuevoProductoPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-caslon text-2xl text-cantera-ink">Nuevo producto</h1>
      <p className="text-sm text-cantera-secondary">
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

        <div className="mt-2">
          <BotonGuardar label="Guardar y agregar receta" labelPendiente="Guardando..." />
        </div>
      </form>
    </div>
  )
}
