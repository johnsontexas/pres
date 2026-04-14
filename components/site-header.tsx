"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogIn, LogOut, User } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { CAMPAIGN_SLOGAN } from "@/lib/campaign"

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Platform", href: "/#platform" },
  { label: "News", href: "/news" },
  { label: "Q&A", href: "/questions" },
  { label: "Contact", href: "/#contact" },
]

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-primary-foreground/10 bg-primary/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex min-w-0 flex-col">
          <Link href="/" className="font-serif text-lg font-bold tracking-tight text-primary-foreground">
            Vote Daniel Johnson
          </Link>
          <span className="mt-0.5 max-w-[14rem] text-[11px] font-medium leading-snug text-primary-foreground/75 sm:max-w-none sm:text-xs">
            {CAMPAIGN_SLOGAN}
          </span>
        </div>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-3 border-l border-primary-foreground/20 pl-6">
              <span className="flex items-center gap-1.5 text-xs text-primary-foreground/70">
                <User className="h-3.5 w-3.5" />
                {user.name}
                {user.isAdmin && (
                  <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    ADMIN
                  </span>
                )}
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-full border border-primary-foreground/25 px-3 py-1.5 text-xs font-medium text-primary-foreground/90 transition-colors hover:bg-primary-foreground/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="flex items-center gap-1.5 rounded-full bg-primary-foreground px-4 py-2 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-primary-foreground md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-primary-foreground/10 bg-primary px-6 py-4 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-primary-foreground/85 transition-colors hover:text-primary-foreground"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-primary-foreground/10 pt-4">
              {user ? (
                <div className="flex flex-col gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-primary-foreground/70">
                    <User className="h-3.5 w-3.5" />
                    {user.name}
                    {user.isAdmin && (
                      <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        ADMIN
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => {
                      signOut()
                      setMobileOpen(false)
                    }}
                    className="flex w-fit items-center gap-1.5 text-sm font-medium text-primary-foreground/90"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-fit items-center gap-1.5 rounded-full bg-primary-foreground px-4 py-2 text-sm font-semibold text-primary"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
