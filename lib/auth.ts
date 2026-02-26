import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const ALLOWED_DOMAIN = "mail.strakejesuit.org"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: ALLOWED_DOMAIN, // Restrict to @mail.strakejesuit.org only
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Belt-and-suspenders: verify domain even if hd param is set
      if (account?.provider === "google" && profile) {
        const email = (profile as { email?: string }).email
        if (email) {
          const domain = email.split("@")[1]
          if (domain !== ALLOWED_DOMAIN) {
            return false // Reject sign-in from other domains
          }
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""
      }
      return session
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
