import { handlers } from "@/auth"

// Force NextAuth API routes to use Node.js runtime to avoid Edge Runtime crypto issues  
export const runtime = 'nodejs'

export const { GET, POST } = handlers