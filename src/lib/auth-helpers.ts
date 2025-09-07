import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * Verifica se o usuário está autenticado em uma API route
 */
export async function verifyAdminAuth(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return {
        isAuthenticated: false,
        error: 'Acesso não autorizado',
        status: 401
      };
    }
    
    return {
      isAuthenticated: true,
      user: {
        id: (session.user as any).id as string,
        email: session.user.email as string,
        role: (session.user as any).role as string
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