import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Admin credentials interface
interface AdminCredentials {
  email: string;
  password: string;
}

// Hard-coded admin credentials (in production, use database)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@fly2any.com',
  password: process.env.ADMIN_PASSWORD || 'fly2any2024!'
};

// Force localhost in development
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    // Force override in development
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    return 'http://localhost:3000';
  }
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://fly2any.com';
};

// Hash the admin password if it's plain text
const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 12);
};

// Verify password
const verifyPassword = (plainPassword: string, hashedPassword: string): boolean => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Admin Credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'admin@fly2any.com'
        },
        password: { 
          label: 'Password', 
          type: 'password' 
        }
      },
      async authorize(credentials): Promise<any> {
        console.log('🔐 [AUTH] Iniciando autorização:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
        });

        if (!credentials?.email || !credentials?.password) {
          console.error('❌ [AUTH] Credenciais incompletas');
          throw new Error('Email e senha são obrigatórios');
        }

        console.log('🔍 [AUTH] Comparando credenciais:', {
          providedEmail: credentials.email,
          expectedEmail: ADMIN_CREDENTIALS.email,
          emailMatch: credentials.email === ADMIN_CREDENTIALS.email
        });

        // Check if credentials match admin account
        if (credentials.email !== ADMIN_CREDENTIALS.email) {
          console.error('❌ [AUTH] Email inválido:', credentials.email);
          throw new Error('Credenciais inválidas');
        }

        // For development, allow plain text comparison
        // In production, use proper password hashing
        const isValidPassword = credentials.password === ADMIN_CREDENTIALS.password ||
                               verifyPassword(credentials.password, ADMIN_CREDENTIALS.password);

        console.log('🔍 [AUTH] Validação de senha:', {
          plainTextMatch: credentials.password === ADMIN_CREDENTIALS.password,
          isValidPassword,
          expectedPassword: ADMIN_CREDENTIALS.password.slice(0, 3) + '***'
        });

        if (!isValidPassword) {
          console.error('❌ [AUTH] Senha inválida');
          throw new Error('Credenciais inválidas');
        }

        console.log('✅ [AUTH] Autorização bem-sucedida');

        // Return user object
        return {
          id: '1',
          email: ADMIN_CREDENTIALS.email,
          name: 'Administrador',
          role: 'admin',
          image: null
        };
      }
    })
  ],
  
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      // First time JWT callback is run, user object is available
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      const actualBaseUrl = getBaseUrl();
      
      console.log('🔄 [AUTH] Redirect callback:', { 
        url, 
        baseUrl, 
        actualBaseUrl,
        NODE_ENV: process.env.NODE_ENV 
      });
      
      // Always use our defined base URL in development
      if (process.env.NODE_ENV === 'development') {
        // Allows relative callback URLs
        if (url.startsWith('/')) {
          const redirectUrl = `${actualBaseUrl}${url}`;
          console.log('✅ [AUTH] Dev redirecting to:', redirectUrl);
          return redirectUrl;
        }
        
        // Extract path from production URLs
        if (url.includes('fly2any.com')) {
          try {
            const urlObj = new URL(url);
            const pathRedirect = `${actualBaseUrl}${urlObj.pathname}${urlObj.search}`;
            console.log('✅ [AUTH] Extracted path redirect to:', pathRedirect);
            return pathRedirect;
          } catch (e) {
            console.error('❌ [AUTH] URL parsing error:', e);
          }
        }
        
        // Default to admin dashboard
        const defaultUrl = `${actualBaseUrl}/admin`;
        console.log('✅ [AUTH] Default dev redirect to:', defaultUrl);
        return defaultUrl;
      }
      
      // Production logic
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
      return `${baseUrl}/admin`;
    }
  },

  debug: process.env.NODE_ENV === 'development',
  
  secret: process.env.NEXTAUTH_SECRET || 'fly2any-super-secret-key-2024',
  
  // Security options
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  cookies: {
    sessionToken: {
      name: `fly2any.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },

  events: {
    async signIn({ user, account, profile }) {
      console.log(`[AUTH] Admin login: ${user.email} at ${new Date().toISOString()}`);
    },
    async signOut({ session, token }) {
      console.log(`[AUTH] Admin logout at ${new Date().toISOString()}`);
    },
  }
};

// Helper function to get server session
export { getServerSession } from 'next-auth';

// Auth configuration export
export default authOptions;