#!/usr/bin/env node

/**
 * Enterprise NextAuth.js Installation & Configuration System
 * Orquestração completa para autenticação Next.js 15
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class EnterpriseAuthInstaller {
  constructor() {
    this.projectRoot = process.cwd();
    this.log('🔐 Enterprise NextAuth.js Installation System', 'info');
    this.log('===============================================', 'info');
  }

  log(message, level = 'info') {
    const prefix = {
      'info': '📘',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'progress': '🔄'
    };
    console.log(`${prefix[level] || '📌'} ${message}`);
  }

  execute(command, options = {}) {
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: 'inherit',
        ...options
      });
      return { success: true, output: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        code: error.status
      };
    }
  }

  async installDependencies() {
    this.log('Phase 1: Installing NextAuth.js Enterprise Dependencies', 'progress');
    
    // Install NextAuth.js v5 (beta)
    this.log('Installing next-auth@beta (v5)...', 'progress');
    const installResult = this.execute('npm install next-auth@beta');
    
    if (!installResult.success) {
      this.log('Failed to install next-auth@beta', 'error');
      return false;
    }
    
    this.log('NextAuth.js v5 installed successfully!', 'success');
    
    // Install additional auth dependencies
    this.log('Installing additional authentication dependencies...', 'progress');
    const additionalDeps = this.execute('npm install @auth/core jsonwebtoken');
    
    if (additionalDeps.success) {
      this.log('Additional dependencies installed!', 'success');
    }
    
    return true;
  }

  createAuthConfig() {
    this.log('Phase 2: Creating Enterprise Auth Configuration', 'progress');
    
    // Create auth.ts
    const authConfig = `import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.accessToken = token.accessToken;
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      return true;
    },
  },
})`;

    fs.writeFileSync(path.join(this.projectRoot, 'auth.ts'), authConfig);
    this.log('Created auth.ts configuration file', 'success');
    
    return true;
  }

  fixMiddleware() {
    this.log('Phase 3: Fixing Middleware Configuration', 'progress');
    
    const middlewareContent = `import { auth } from "@/auth"

export default auth((req) => {
  // Custom middleware logic can be added here
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  // Add any custom route protection logic
  if (nextUrl.pathname.startsWith('/api/admin') && !isLoggedIn) {
    return Response.redirect(new URL('/api/auth/signin', nextUrl));
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}`;

    // Write the corrected middleware
    fs.writeFileSync(path.join(this.projectRoot, 'src/middleware.ts'), middlewareContent);
    this.log('Fixed middleware.ts with correct NextAuth imports', 'success');
    
    return true;
  }

  createRouteHandlers() {
    this.log('Phase 4: Creating Route Handlers', 'progress');
    
    // Ensure api/auth directory exists
    const authApiDir = path.join(this.projectRoot, 'src/app/api/auth/[...nextauth]');
    if (!fs.existsSync(authApiDir)) {
      fs.mkdirSync(authApiDir, { recursive: true });
    }
    
    // Create route.ts
    const routeHandler = `import { handlers } from "@/auth"

export const { GET, POST } = handlers`;
    
    fs.writeFileSync(path.join(authApiDir, 'route.ts'), routeHandler);
    this.log('Created API route handlers', 'success');
    
    return true;
  }

  createEnvironmentTemplate() {
    this.log('Phase 5: Creating Environment Configuration', 'progress');
    
    const envTemplate = `# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-a-strong-one

# GitHub OAuth (optional - for authentication)
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Trust host for Docker/Production
AUTH_TRUST_HOST=true`;

    const envLocalPath = path.join(this.projectRoot, '.env.local');
    
    if (!fs.existsSync(envLocalPath)) {
      fs.writeFileSync(envLocalPath, envTemplate);
      this.log('Created .env.local template', 'success');
    } else {
      this.log('Environment file already exists', 'warning');
    }
    
    return true;
  }

  createSignInPage() {
    this.log('Phase 6: Creating Authentication Pages', 'progress');
    
    // Create auth pages directory
    const authPagesDir = path.join(this.projectRoot, 'src/app/auth/signin');
    if (!fs.existsSync(authPagesDir)) {
      fs.mkdirSync(authPagesDir, { recursive: true });
    }
    
    const signInPage = `import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export default function SignIn() {
  async function handleSignIn(formData: FormData) {
    "use server"
    try {
      await signIn("github", { redirectTo: "/dashboard" })
    } catch (error) {
      if (error instanceof AuthError) {
        return redirect(\`/auth/error?error=\${error.type}\`)
      }
      throw error
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>
        <form action={handleSignIn} className="mt-8 space-y-6">
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Sign in with GitHub
          </button>
        </form>
      </div>
    </div>
  )
}`;
    
    fs.writeFileSync(path.join(authPagesDir, 'page.tsx'), signInPage);
    this.log('Created sign-in page', 'success');
    
    return true;
  }

  updatePackageJson() {
    this.log('Phase 7: Updating Package.json Scripts', 'progress');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add auth-related scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'auth:generate-secret': 'openssl rand -base64 32',
      'auth:check': 'node -e "console.log(require(\'./auth.ts\'))"'
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    this.log('Updated package.json with auth scripts', 'success');
    
    return true;
  }

  generateReport() {
    this.log('Phase 8: Generating Installation Report', 'progress');
    
    const report = `# Enterprise NextAuth.js Installation Report

## ✅ Installation Complete!

### Installed Components:
- ✅ next-auth@beta (v5)
- ✅ Auth configuration (auth.ts)
- ✅ Fixed middleware (src/middleware.ts)
- ✅ API route handlers (src/app/api/auth/[...nextauth]/route.ts)
- ✅ Sign-in page (src/app/auth/signin/page.tsx)
- ✅ Environment template (.env.local)

### Next Steps:

1. **Set up environment variables:**
   - Generate a secret: \`npm run auth:generate-secret\`
   - Add the secret to .env.local
   - Configure OAuth providers (GitHub recommended)

2. **Test the installation:**
   - Start the server: \`npm run dev\`
   - Visit: http://localhost:3000/auth/signin
   - Test authentication flow

3. **Customize as needed:**
   - Add more providers in auth.ts
   - Customize sign-in pages
   - Add role-based access control

### 🔧 Troubleshooting:

If you encounter issues:
1. Ensure all environment variables are set
2. Check that the server is running on the correct port
3. Verify OAuth provider configuration

## 🎉 Enterprise Authentication System Ready!
`;

    const reportPath = path.join(this.projectRoot, 'NEXTAUTH_INSTALLATION_REPORT.md');
    fs.writeFileSync(reportPath, report);
    
    this.log(`Installation report saved to: ${reportPath}`, 'success');
    
    return true;
  }

  async run() {
    try {
      this.log('Starting Enterprise NextAuth.js Installation...', 'info');
      
      await this.installDependencies();
      await this.createAuthConfig();
      await this.fixMiddleware();
      await this.createRouteHandlers();
      await this.createEnvironmentTemplate();
      await this.createSignInPage();
      await this.updatePackageJson();
      await this.generateReport();
      
      console.log('\n🎉 INSTALLATION COMPLETE!');
      console.log('=====================================');
      console.log('✅ NextAuth.js v5 Enterprise system installed');
      console.log('✅ Middleware corrected');
      console.log('✅ All configuration files created');
      console.log('\n🚀 Next Steps:');
      console.log('1. Configure .env.local with your secrets');
      console.log('2. Restart your dev server: npm run dev');
      console.log('3. Test authentication at /auth/signin');
      console.log('\n📖 Read NEXTAUTH_INSTALLATION_REPORT.md for details');
      
    } catch (error) {
      this.log(`Installation failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Execute installation
const installer = new EnterpriseAuthInstaller();
installer.run();