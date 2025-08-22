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
      image?: string | null;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id?: string;
    userId?: string;
    role?: string;
    accessToken?: string;
  }
}