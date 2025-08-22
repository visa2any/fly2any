import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { auth } from '@/auth';
import { authOptions } from '@/lib/auth';

/**
 * Verifica se o usuário está autenticado em uma API route
 */
export async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET || 'fly2any-super-secret-key-2024'
    });
    
    if (!token || token.role !== 'admin') {
      return {
        isAuthenticated: false,
        error: 'Acesso não autorizado',
        status: 401
      };
    }
    
    return {
      isAuthenticated: true,
      user: {
        id: token.id as string,
        email: token.email as string,
        role: token.role as string
      }
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Erro de autenticação',
      status: 500
    };
  }
}

/**
 * Verifica se o usuário está autenticado em um Server Component
 */
export async function verifyServerAuth() {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return {
        isAuthenticated: false,
        error: 'Acesso não autorizado'
      };
    }
    
    return {
      isAuthenticated: true,
      user: session.user
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Erro de autenticação'
    };
  }
}

/**
 * Cria uma resposta de erro não autorizado
 */
export function createUnauthorizedResponse(message: string = 'Acesso não autorizado') {
  return Response.json(
    {
      error: 'Unauthorized',
      message
    },
    { status: 401 }
  );
}

/**
 * Middleware helper para proteger API routes
 */
export async function requireAuth(request: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) {
  const auth = await verifyAdminAuth(request);
  
  if (!auth.isAuthenticated) {
    return createUnauthorizedResponse(auth.error);
  }
  
  // Adiciona informações do usuário ao request
  (request as any).user = auth.user;
  
  return handler(request);
}