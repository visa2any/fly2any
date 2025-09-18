import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@fly2any.com',
  password: process.env.ADMIN_PASSWORD || 'fly2any2024!'
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] Authorization attempt:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
        });

        if (!credentials?.email || !credentials?.password) {
          console.error('❌ [AUTH] Missing credentials');
          return null;
        }

        // Check admin credentials
        if (credentials.email === ADMIN_CREDENTIALS.email &&
            credentials.password === ADMIN_CREDENTIALS.password) {
          console.log('✅ [AUTH] Admin login successful');
          return {
            id: 'admin',
            email: ADMIN_CREDENTIALS.email,
            name: 'Administrator',
            role: 'admin'
          };
        }

        console.error('❌ [AUTH] Invalid credentials provided');
        return null;
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'fly2any-dev-secret-2024',
  debug: process.env.NODE_ENV === 'development'
})

export { default as auth } from "next-auth"