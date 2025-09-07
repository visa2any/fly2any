import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
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
        if (credentials.email === ADMIN_CREDENTIALS.email) {
          console.log('🔍 [AUTH] Validating admin user');
          
          // Handle escaped characters in environment variables
          const cleanPassword = ADMIN_CREDENTIALS.password.replace(/\\!/g, '!');
          const isValidPassword = credentials.password === cleanPassword || 
                                 credentials.password === ADMIN_CREDENTIALS.password;
          
          if (!isValidPassword) {
            console.error('❌ [AUTH] Invalid admin password');
            return null;
          }

          console.log('✅ [AUTH] Admin authorized successfully');
          return {
            id: '1',
            email: ADMIN_CREDENTIALS.email,
            name: 'Administrator',
            role: 'admin'
          };
        }

        console.error('❌ [AUTH] Email not found:', credentials.email);
        return null;
      }
    }),
    GithubProvider({
      clientId: process.env.AUTH_GITHUB_ID || "placeholder_github_id",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "placeholder_github_secret",
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update every hour
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.userId = user.id;
        token.role = (user as any).role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      if (token.role) {
        (session.user as any).role = token.role;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fly2any-super-secret-key-2024',
})