'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from './nav-items'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/login')) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-zinc-200 md:bg-white md:px-4 md:py-6">
        <div className="mb-8 px-2">
          <p className="text-lg font-bold text-rose-800">Vicu Accesorios</p>
          <p className="text-sm text-zinc-500">Costos y precios</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-rose-100 text-rose-900' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header mobile */}
        <header className="border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
          <p className="text-lg font-bold text-rose-800">Vicu Accesorios</p>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>

        {/* Bottom nav mobile */}
        <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                  active ? 'text-rose-800' : 'text-zinc-500'
                }`}
              >
                <Icon size={22} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
