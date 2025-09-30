import { handlers } from "@/auth"
import type { NextRequest } from "next/server"

// Force NextAuth API routes to use Node.js runtime to avoid Edge Runtime crypto issues
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Additional config to prevent worker issues
export const maxDuration = 30
export const fetchCache = 'force-no-store'

// NextAuth v5 beta compatible handlers - direct export without wrapper
export const { GET, POST } = handlers