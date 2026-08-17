'use client'

import { Trash2 } from 'lucide-react'

export default function EliminarProductoBoton({
  nombre,
  action,
}: {
  nombre: string
  action: () => void
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        onClick={(e) => {
          if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
            e.preventDefault()
          }
        }}
        className="flex items-center gap-1.5 text-sm text-red-600 underline"
      >
        <Trash2 size={16} /> Eliminar producto
      </button>
    </form>
  )
}
