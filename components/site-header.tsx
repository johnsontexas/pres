"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, LogIn, LogOut, User } from "lucide-react"
import { useAuth } from "@/components/auth-context"

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Platform", href: "/#platform" },
  { label: "News", href: "/news" },
  { label: "Q&A", href: "/questions" },
  { label: "Vote", href: "/#vote" },
]

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-primary-foreground/10 bg-primary/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/crest.jpg"
            alt="Strake Jesuit crest"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="font-serif text-lg font-bold text-primary-foreground">
            Johnson 4 Pres
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/75 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              {link.label}
            </Link>
          ))}

          <div className="ml-2 h-6 w-px bg-primary-foreground/15" />

          {/* Auth button */}
          {user ? (
            <div className="ml-2 flex items-center gap-3">
              <span className="flex items-center gap-2 text-xs text-primary-foreground/70">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-6 w-6 rounded-full ring-2 ring-primary-foreground/20"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/15">
                    <User className="h-3 w-3 text-primary-foreground" />
                  </span>
                )}
                <span className="max-w-[100px] truncate font-medium text-primary-foreground/90">{user.name}</span>
                {user.isAdmin && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 rounded-md bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/signin"
              className="ml-2 flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md p-2 text-primary-foreground transition-colors hover:bg-primary-foreground/10 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-primary-foreground/10 bg-primary px-6 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                {link.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-primary-foreground/10" />

            {user ? (
              <div className="flex flex-col gap-3 px-3 py-2">
                <span className="flex items-center gap-2 text-sm text-primary-foreground/80">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-6 w-6 rounded-full"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/15">
                      <User className="h-3 w-3 text-primary-foreground" />
                    </span>
                  )}
                  {user.name}
                  {user.isAdmin && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground uppercase">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={() => {
                    signOut()
                    setMobileOpen(false)
                  }}
                  className="flex w-fit items-center gap-2 rounded-md text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/signin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
