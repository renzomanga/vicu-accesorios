export default function Campo({
  label,
  name,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-cantera-secondary">{label}</span>
      <input
        name={name}
        className="rounded-lg border border-cantera-sand px-4 py-3 text-base focus:border-cantera-primary focus:outline-none"
        {...props}
      />
      {hint && <span className="text-xs text-cantera-secondary">{hint}</span>}
    </label>
  )
}
