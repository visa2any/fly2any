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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        // Check if credentials match admin account
        if (credentials.email !== ADMIN_CREDENTIALS.email) {
          throw new Error('Credenciais inválidas');
        }

        // For development, allow plain text comparison
        // In production, use proper password hashing
        const isValidPassword = credentials.password === ADMIN_CREDENTIALS.password ||
                               verifyPassword(credentials.password, ADMIN_CREDENTIALS.password);

        if (!isValidPassword) {
          throw new Error('Credenciais inválidas');
        }

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