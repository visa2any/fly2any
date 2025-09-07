import { handlers } from "@/auth"

// Force NextAuth API routes to use Node.js runtime to avoid Edge Runtime crypto issues  
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Additional config to prevent worker issues
export const maxDuration = 30
export const fetchCache = 'force-no-store'

export const { GET, POST } = handlers