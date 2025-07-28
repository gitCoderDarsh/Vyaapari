import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  // Only use PrismaAdapter for OAuth providers, not credentials
  // adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day default, extended by remember me
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        console.log('Login - User found:', !!user)
        console.log('Login - Input password:', credentials.password)
        console.log('Login - Stored hash:', user?.password)

        if (!user) {
          console.log('Login - User not found')
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        console.log('Login - Password match:', isPasswordValid)

        if (!isPasswordValid) {
          console.log('Login - Password validation failed')
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`.trim() || null,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          phone: user.phone,
          image: user.image,
          rememberMe: credentials.rememberMe === 'true',
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth", 
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback - Provider:', account?.provider)
      console.log('SignIn callback - User:', user?.email)
      
      // Handle Google sign in manually
      if (account?.provider === "google") {
        try {
          console.log('Google OAuth - Processing sign in for:', user.email)
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (!existingUser) {
            // Create new Google user
            await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                image: user.image,
                emailVerified: new Date(),
              }
            })
            console.log('Google signup - User created:', user.email)
          } else {
            console.log('Google login - User exists:', user.email)
          }
          return true
        } catch (error) {
          console.error('Google auth error:', error)
          return false
        }
      }
      
      // For credentials provider, always allow (handled in authorize)
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard/inventory after successful authentication
      if (url === baseUrl || url === `${baseUrl}/auth`) {
        return `${baseUrl}/dashboard/inventory`
      }
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user, account, trigger, session }) {
      // Handle profile updates triggered by update() function
      if (trigger === "update" && session) {
        console.log("JWT callback - Profile update triggered:", session)
        // Merge the updated session data into the token
        token.firstName = session.firstName || token.firstName
        token.lastName = session.lastName || token.lastName
        token.businessName = session.businessName || token.businessName
        token.phone = session.phone || token.phone
        token.email = session.email || token.email
        token.name = session.name || `${session.firstName || token.firstName} ${session.lastName || token.lastName}`.trim() || token.name
        console.log("JWT callback - Token updated with:", {
          firstName: token.firstName,
          lastName: token.lastName,
          businessName: token.businessName,
          phone: token.phone,
          email: token.email
        })
        return token
      }
      
      // Initial sign in
      if (account && user) {
        // For Google OAuth
        if (account.provider === "google") {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          if (dbUser) {
            token.id = dbUser.id
            token.name = dbUser.name
            token.email = dbUser.email
            token.image = dbUser.image
          }
        }
        // For credentials login (user data comes from authorize function)
        else if (account.provider === "credentials") {
          token.id = user.id
          token.name = user.name
          token.firstName = user.firstName
          token.lastName = user.lastName
          token.businessName = user.businessName
          token.phone = user.phone
          token.email = user.email
          token.image = user.image
          token.rememberMe = user.rememberMe
          
          // Set token expiration based on remember me
          if (user.rememberMe) {
            token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
          } else {
            token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 1 day
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.businessName = token.businessName
        session.user.phone = token.phone
        session.user.email = token.email
        session.user.image = token.image
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
