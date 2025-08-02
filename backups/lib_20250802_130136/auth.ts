import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Admin credentials interface
interface AdminCredentials {
  email: string;
  password: string;
}

// 🚨 SECURITY WARNING: This implementation uses hardcoded credentials
// In production, you MUST:
// 1. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH environment variables
// 2. Use properly hashed passwords (bcrypt with salt)
// 3. Move to database-based authentication
// 4. Remove hardcoded fallback values

if (process.env.NODE_ENV === 'production' && 
    (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH)) {
  console.error('🚨 CRITICAL SECURITY WARNING: Admin credentials not properly configured for production!');
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH environment variables');
}

const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@fly2any.com',
  // Use ADMIN_PASSWORD_HASH in production, ADMIN_PASSWORD for dev
  password: process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || 'fly2any2024!'
};

// Demo user credentials (in production, use database with proper registration)
const DEMO_USERS = [
  {
    id: '2',
    email: 'user@fly2any.com',
    password: 'user123!',
    name: 'Usuário Demo',
    role: 'user'
  },
  {
    id: '3', 
    email: 'guest@fly2any.com',
    password: 'guest123!',
    name: 'Convidado Demo',
    role: 'user'
  }
];

// Get correct base URL for environment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Production URLs
  return process.env.NEXTAUTH_URL || 'https://www.fly2any.com';
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

        // Check admin credentials first
        if (credentials.email === ADMIN_CREDENTIALS.email) {
          console.log('🔍 [AUTH] Validando admin');
          
          const isValidPassword = credentials.password === ADMIN_CREDENTIALS.password ||
                                 verifyPassword(credentials.password, ADMIN_CREDENTIALS.password);

          if (!isValidPassword) {
            console.error('❌ [AUTH] Senha admin inválida');
            throw new Error('Credenciais inválidas');
          }

          console.log('✅ [AUTH] Admin autorizado');
          return {
            id: '1',
            email: ADMIN_CREDENTIALS.email,
            name: 'Administrador',
            role: 'admin',
            image: null
          };
        }

        // Check demo users
        const demoUser = DEMO_USERS.find(user => user.email === credentials.email);
        if (demoUser) {
          console.log('🔍 [AUTH] Validando usuário demo:', demoUser.email);
          
          if (credentials.password !== demoUser.password) {
            console.error('❌ [AUTH] Senha de usuário inválida');
            throw new Error('Credenciais inválidas');
          }

          console.log('✅ [AUTH] Usuário demo autorizado');
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            image: null
          };
        }

        // If no match found
        console.error('❌ [AUTH] Email não encontrado:', credentials.email);
        throw new Error('Credenciais inválidas');
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
      
      if (process.env.NODE_ENV === 'production') {
        console.log('🔄 [PROD-AUTH] Redirect callback:', { 
          url, 
          baseUrl, 
          actualBaseUrl 
        });
      }
      
      // Development logic
      if (process.env.NODE_ENV === 'development') {
        if (url.startsWith('/')) {
          return `${actualBaseUrl}${url}`;
        }
        if (url.includes('fly2any.com')) {
          try {
            const urlObj = new URL(url);
            return `${actualBaseUrl}${urlObj.pathname}${urlObj.search}`;
          } catch (e) {
            console.error('❌ [AUTH] URL parsing error:', e);
          }
        }
        return `${actualBaseUrl}/admin`;
      }
      
      // Production logic - be more strict
      try {
        // Relative URLs are safe
        if (url.startsWith('/')) {
          const redirectUrl = `${actualBaseUrl}${url}`;
          console.log('✅ [PROD-AUTH] Relative redirect:', redirectUrl);
          return redirectUrl;
        }
        
        // Parse full URLs and validate
        const urlObj = new URL(url);
        const baseUrlObj = new URL(actualBaseUrl);
        
        // Same origin check
        if (urlObj.origin === baseUrlObj.origin) {
          console.log('✅ [PROD-AUTH] Same origin redirect:', url);
          return url;
        }
        
        // Default fallback
        const fallbackUrl = `${actualBaseUrl}/admin`;
        console.log('✅ [PROD-AUTH] Fallback redirect:', fallbackUrl);
        return fallbackUrl;
        
      } catch (error) {
        console.error('❌ [PROD-AUTH] Redirect error:', error);
        return `${actualBaseUrl}/admin`;
      }
    }
  },

  debug: false, // Disable debug to prevent JSON parsing errors
  
  secret: process.env.NEXTAUTH_SECRET || 'fly2any-super-secret-key-2024',
  
  // Security options
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.fly2any.com' : undefined
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.callback-url' 
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.fly2any.com' : undefined
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Host-next-auth.csrf-token' 
        : 'next-auth.csrf-token',
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
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUTH] Login: ${user.email} at ${new Date().toISOString()}`);
      }
    },
    async signOut({ session, token }) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUTH] Logout at ${new Date().toISOString()}`);
      }
    },
  },

  // Use NEXTAUTH_URL from environment for host configuration
  // trustHost is not a valid NextAuth v4 option
  
  logger: {
    error: (code, metadata) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[NextAuth Error]', code, metadata);
      }
    },
    warn: (code) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[NextAuth Warning]', code);
      }
    },
    debug: () => {}, // Disable debug logging
  }
};

// Helper function to get server session
export { getServerSession } from 'next-auth';

// Auth configuration export
export default authOptions;