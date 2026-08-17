'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from './nav-items'

function Marca({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image src="/isotipo.svg" alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
      <div>
        <p className="font-caslon text-lg leading-none text-cantera-ink">Cantera Joyas</p>
        {!compact && <p className="caption mt-1 text-cantera-secondary">Costos y precios</p>}
      </div>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/login')) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-cantera-sand md:bg-white md:px-4 md:py-6">
        <div className="mb-8 px-2">
          <Marca />
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
                  active
                    ? 'bg-cantera-primary/10 text-cantera-primary'
                    : 'text-cantera-secondary hover:bg-cantera-sand/30'
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
        <header className="border-b border-cantera-sand bg-white px-4 py-3 md:hidden">
          <Marca compact />
        </header>

        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>

        {/* Bottom nav mobile */}
        <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-cantera-sand bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                  active ? 'text-cantera-primary' : 'text-cantera-secondary/70'
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
