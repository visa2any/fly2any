import NextAuth from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
      loginTime?: number;
      image?: string | null;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
    loginTime?: number;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id?: string;
    userId?: string;
    role?: string;
    loginTime?: number;
    accessToken?: string;
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    role?: string;
    loginTime?: number;
  }
}