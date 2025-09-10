import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"

// CRITICAL FIX: Prevent build-time execution for NextAuth v5 beta
const getAdminCredentials = () => {
  // Only access process.env during runtime, not build time
  if (typeof process === 'undefined') return { email: '', password: '' };
  
  return {
    email: process.env.ADMIN_EMAIL || 'admin@fly2any.com',
    password: process.env.ADMIN_PASSWORD || 'fly2any2024!'
  };
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
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

        // Get admin credentials at runtime
        const ADMIN_CREDENTIALS = getAdminCredentials();

        // Check admin credentials
        if (credentials.email === ADMIN_CREDENTIALS.email) {
          console.log('🔍 [AUTH] Validating admin user');
          console.log('🔍 [AUTH] Expected password:', ADMIN_CREDENTIALS.password);
          console.log('🔍 [AUTH] Provided password:', credentials.password);
          
          // Handle escaped characters in environment variables
          const cleanPassword = ADMIN_CREDENTIALS.password.replace(/\\!/g, '!');
          const isValidPassword = credentials.password === cleanPassword || 
                                 credentials.password === ADMIN_CREDENTIALS.password;
          
          if (!isValidPassword) {
            console.error('❌ [AUTH] Invalid admin password');
            console.error('❌ [AUTH] Expected (clean):', cleanPassword);
            console.error('❌ [AUTH] Expected (raw):', ADMIN_CREDENTIALS.password);
            console.error('❌ [AUTH] Provided:', credentials.password);
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
    GitHub({
      clientId: typeof process !== 'undefined' ? (process.env.AUTH_GITHUB_ID || "placeholder_github_id") : "placeholder_github_id",
      clientSecret: typeof process !== 'undefined' ? (process.env.AUTH_GITHUB_SECRET || "placeholder_github_secret") : "placeholder_github_secret",
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
  secret: typeof process !== 'undefined' ? (process.env.NEXTAUTH_SECRET || 'fly2any-super-secret-key-2024') : 'fly2any-super-secret-key-2024',
})