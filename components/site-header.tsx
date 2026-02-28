"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, MessageSquare, LogIn, LogOut, User } from "lucide-react"
import { useAuth } from "@/components/auth-context"

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
    <header className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="font-semibold text-lg text-foreground transition-opacity hover:opacity-70">
          Daniel Johnson
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-3 border-l border-border/50 pl-6">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                {user.name}
                {user.isAdmin && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    ADMIN
                  </span>
                )}
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground/70 transition-all hover:border-border hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border/50 bg-background/95 px-6 py-4 backdrop-blur-md md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-border/50 pt-4">
              {user ? (
                <div className="flex flex-col gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    {user.name}
                    {user.isAdmin && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        ADMIN
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => {
                      signOut()
                      setMobileOpen(false)
                    }}
                    className="flex w-fit items-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
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
