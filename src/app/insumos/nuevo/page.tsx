import { crearInsumo } from '../actions'
import Campo from '@/components/Campo'
import BotonGuardar from '@/components/BotonGuardar'

export default function NuevoInsumoPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-caslon text-2xl text-cantera-ink">Nuevo insumo</h1>

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

        <div className="mt-2">
          <BotonGuardar label="Guardar insumo" />
        </div>
      </form>
    </div>
  )
}
