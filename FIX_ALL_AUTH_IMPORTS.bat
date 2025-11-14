@echo off
echo Fixing all auth imports in API routes...

REM Replace getServerSession imports with auth imports in all new API files
powershell -Command "(Get-Content 'app\api\travelers\route.ts') -replace 'import { getServerSession } from ''next-auth'';', 'import { auth } from ''@/lib/auth'';' -replace 'import { authOptions } from ''@/lib/auth.config'';', '' -replace 'const session = await getServerSession\(authOptions\);', 'const session = await auth();' | Set-Content 'app\api\travelers\route.ts'"

powershell -Command "(Get-Content 'app\api\travelers\[id]\route.ts') -replace 'import { getServerSession } from ''next-auth'';', 'import { auth } from ''@/lib/auth'';' -replace 'import { authOptions } from ''@/lib/auth.config'';', '' -replace 'const session = await getServerSession\(authOptions\);', 'const session = await auth();' | Set-Content 'app\api\travelers\[id]\route.ts'"

powershell -Command "(Get-Content 'app\api\travelers\[id]\set-default\route.ts') -replace 'import { getServerSession } from ''next-auth'';', 'import { auth } from ''@/lib/auth'';' -replace 'import { authOptions } from ''@/lib/auth.config'';', '' -replace 'const session = await getServerSession\(authOptions\);', 'const session = await auth();' | Set-Content 'app\api\travelers\[id]\set-default\route.ts'"

powershell -Command "(Get-Content 'app\api\payment-methods\route.ts') -replace 'import { getServerSession } from ''next-auth'';', 'import { auth } from ''@/lib/auth'';' -replace 'import { authOptions } from ''@/lib/auth.config'';', '' -replace 'const session = await getServerSession\(authOptions\);', 'const session = await auth();' | Set-Content 'app\api\payment-methods\route.ts'"

powershell -Command "(Get-Content 'app\api\payment-methods\[id]\route.ts') -replace 'import { getServerSession } from ''next-auth'';', 'import { auth } from ''@/lib/auth'';' -replace 'import { authOptions } from ''@/lib/auth.config'';', '' -replace 'const session = await getServerSession\(authOptions\);', 'const session = await auth();' | Set-Content 'app\api\payment-methods\[id]\route.ts'"

powershell -Command "(Get-Content 'app\api\payment-methods\[id]\set-default\route.ts') -replace 'import { getServerSession } from ''next-auth'';', 'import { auth } from ''@/lib/auth'';' -replace 'import { authOptions } from ''@/lib/auth.config'';', '' -replace 'const session = await getServerSession\(authOptions\);', 'const session = await auth();' | Set-Content 'app\api\payment-methods\[id]\set-default\route.ts'"

powershell -Command "(Get-Content 'app\api\documents\route.ts') -replace 'import { getServerSession } from ''next-auth'';', 'import { auth } from ''@/lib/auth'';' -replace 'import { authOptions } from ''@/lib/auth.config'';', '' -replace 'const session = await getServerSession\(authOptions\);', 'const session = await auth();' | Set-Content 'app\api\documents\route.ts'"

powershell -Command "(Get-Content 'app\api\documents\[id]\route.ts') -replace 'import { getServerSession } from ''next-auth'';', 'import { auth } from ''@/lib/auth'';' -replace 'import { authOptions } from ''@/lib/auth.config'';', '' -replace 'const session = await getServerSession\(authOptions\);', 'const session = await auth();' | Set-Content 'app\api\documents\[id]\route.ts'"

echo Done! All auth imports fixed.
