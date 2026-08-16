export default function ConfiguracionPendiente() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
      <p className="font-semibold">Falta conectar Supabase</p>
      <p className="mt-1 text-sm">
        Completá <code className="rounded bg-amber-100 px-1">.env.local</code> con las claves de
        tu proyecto de Supabase y corré <code className="rounded bg-amber-100 px-1">supabase/schema.sql</code> en
        el SQL Editor para que esta pantalla funcione con datos reales. Instrucciones en el{' '}
        <code className="rounded bg-amber-100 px-1">README.md</code>.
      </p>
    </div>
  )
}
