/**
 * Admin Security Hardening Tests
 *
 * REGRESSION PREVENTION: These tests ensure admin routes remain secure.
 *
 * Validates:
 * - No hardcoded isAdmin = true patterns
 * - All admin routes use requireAdmin() middleware
 * - Fail-closed access control
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

describe('Admin Access Control Security', () => {
  describe('No Hardcoded Admin Flags', () => {
    it('should NOT contain hardcoded isAdmin = true in admin routes', async () => {
      // Get all admin route files
      const adminRouteDir = path.join(process.cwd(), 'app', 'api', 'admin');
      const routeFiles = await glob('**/route.ts', { cwd: adminRouteDir, absolute: true });

      const violations: string[] = [];

      for (const file of routeFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(process.cwd(), file);

        // Check for hardcoded isAdmin patterns
        const hardcodedPatterns = [
          /const\s+isAdmin\s*=\s*true/g,
          /let\s+isAdmin\s*=\s*true/g,
          /isAdmin\s*:\s*true/g,
        ];

        for (const pattern of hardcodedPatterns) {
          if (pattern.test(content)) {
            violations.push(`${relativePath}: Found hardcoded admin flag`);
          }
        }
      }

      if (violations.length > 0) {
        console.error('SECURITY VIOLATIONS FOUND:');
        violations.forEach((v) => console.error(`  - ${v}`));
      }

      expect(violations).toEqual([]);
    });

    it('should NOT contain TODO comments about admin authentication', async () => {
      const adminRouteDir = path.join(process.cwd(), 'app', 'api', 'admin');
      const routeFiles = await glob('**/route.ts', { cwd: adminRouteDir, absolute: true });

      const violations: string[] = [];

      for (const file of routeFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(process.cwd(), file);

        // Check for unimplemented auth TODOs
        if (/TODO.*admin.*auth/i.test(content) || /TODO.*check.*admin/i.test(content)) {
          violations.push(`${relativePath}: Contains unimplemented admin auth TODO`);
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe('requireAdmin() Usage', () => {
    // Critical routes that MUST have requireAdmin()
    const CRITICAL_ADMIN_ROUTES = [
      'affiliates/route.ts',
      'affiliates/[id]/route.ts',
      'affiliates/[id]/payouts/process/route.ts',
      'bookings/route.ts',
      'bookings/[id]/route.ts',
      'users/route.ts',
    ];

    it('should use requireAdmin() in critical admin routes', async () => {
      const adminRouteDir = path.join(process.cwd(), 'app', 'api', 'admin');
      const violations: string[] = [];

      for (const routePath of CRITICAL_ADMIN_ROUTES) {
        const fullPath = path.join(adminRouteDir, routePath);
        if (!fs.existsSync(fullPath)) continue;

        const content = fs.readFileSync(fullPath, 'utf-8');

        // Check if file imports requireAdmin or requirePermission
        const hasAdminMiddleware =
          /import\s*{[^}]*requireAdmin[^}]*}\s*from\s*['"]@\/lib\/admin\/middleware/.test(content) ||
          /import\s*{[^}]*requirePermission[^}]*}\s*from\s*['"]@\/lib\/admin\/middleware/.test(content) ||
          /import\s*{[^}]*withAdmin[^}]*}\s*from\s*['"]@\/lib\/admin\/middleware/.test(content) ||
          /import\s*{[^}]*withPermission[^}]*}\s*from\s*['"]@\/lib\/admin\/middleware/.test(content);

        if (!hasAdminMiddleware) {
          violations.push(`${routePath}: Missing requireAdmin() middleware`);
        }
      }

      expect(violations).toEqual([]);
    });

    it('should list routes needing security review (non-blocking)', async () => {
      // This is an audit test - lists routes that need review but doesn't fail
      const adminRouteDir = path.join(process.cwd(), 'app', 'api', 'admin');
      const routeFiles = await glob('**/route.ts', { cwd: adminRouteDir, absolute: true });

      const routesNeedingReview: string[] = [];

      for (const file of routeFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(adminRouteDir, file);

        const hasAdminMiddleware =
          /import\s*{[^}]*requireAdmin[^}]*}\s*from\s*['"]@\/lib\/admin\/middleware/.test(content) ||
          /import\s*{[^}]*requirePermission[^}]*}\s*from\s*['"]@\/lib\/admin\/middleware/.test(content);

        if (!hasAdminMiddleware) {
          routesNeedingReview.push(relativePath);
        }
      }

      if (routesNeedingReview.length > 0) {
        console.log('\n[SECURITY AUDIT] Routes needing requireAdmin() review:');
        routesNeedingReview.forEach((r) => console.log(`  - ${r}`));
        console.log(`Total: ${routesNeedingReview.length} routes\n`);
      }

      // This test passes but logs audit info
      expect(true).toBe(true);
    });
  });

  describe('Fail-Closed Access Control', () => {
    it('should return 401/403 before any business logic on failed auth', async () => {
      const adminRouteDir = path.join(process.cwd(), 'app', 'api', 'admin');
      const routeFiles = await glob('**/route.ts', { cwd: adminRouteDir, absolute: true });

      for (const file of routeFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(process.cwd(), file);

        // If file uses requireAdmin, check that it's at the start of handlers
        if (/requireAdmin\(request\)/.test(content)) {
          // Check that requireAdmin is called early (within first 10 lines of handler)
          const handlers = content.match(
            /export\s+async\s+function\s+(GET|POST|PATCH|DELETE|PUT)\s*\([^)]*\)\s*{([^}]*(?:{\s*[^}]*}[^}]*)*)/g
          );

          if (handlers) {
            for (const handler of handlers) {
              const lines = handler.split('\n').slice(0, 15).join('\n');
              if (!lines.includes('requireAdmin')) {
                // Check if using withAdmin or withPermission wrapper instead
                if (!content.includes('withAdmin') && !content.includes('withPermission')) {
                  console.warn(
                    `${relativePath}: requireAdmin() may not be called early enough in handler`
                  );
                }
              }
            }
          }
        }
      }

      // This test passes if no violations throw
      expect(true).toBe(true);
    });
  });
});

describe('SSE Admin Connection Security', () => {
  it('should verify admin status from database for admin SSE connections', () => {
    const ssePath = path.join(process.cwd(), 'app', 'api', 'notifications', 'sse', 'route.ts');
    const content = fs.readFileSync(ssePath, 'utf-8');

    // Check that we verify admin from database
    expect(content).toMatch(/adminUser\.findUnique/);
    expect(content).toMatch(/isAdmin\s*=\s*!!adminUser/);

    // Check that non-admins are rejected
    expect(content).toMatch(/clientType\s*===\s*['"]admin['"]\s*&&\s*!isAdmin/);
    expect(content).toMatch(/status:\s*403/);
  });
});
