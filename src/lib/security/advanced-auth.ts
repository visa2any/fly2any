/**
 * Advanced Authentication and Authorization for Brazilian Diaspora Platform
 * Implements enterprise-grade JWT security, session management, and LGPD compliance
 */

import jwt from 'jsonwebtoken';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { NextRequest } from 'next/server';
import { generateSecurityAuditLog, SecurityAuditLog } from './security-config';

// Advanced JWT Configuration
export interface JWTConfig {
  secret: string;
  issuer: string;
  audience: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  algorithm: jwt.Algorithm;
  keyRotationPeriod: number; // hours
}

export const JWT_CONFIG: JWTConfig = {
  secret: (process.env.JWT_SECRET || 'ultra-secure-jwt-secret-change-in-production') as string,
  issuer: 'fly2any.com',
  audience: 'fly2any-users',
  accessTokenExpiry: '15m', // Short-lived access tokens
  refreshTokenExpiry: '7d', // Longer refresh tokens
  algorithm: 'HS256' as jwt.Algorithm,
  keyRotationPeriod: 24 // Rotate keys every 24 hours
};

// User roles and permissions for Brazilian diaspora platform
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  DPO = 'dpo', // Data Protection Officer
  SUPPORT = 'support',
  MARKETING = 'marketing'
}

export interface UserPermissions {
  canViewPersonalData: boolean;
  canExportData: boolean;
  canDeleteData: boolean;
  canManageConsents: boolean;
  canAccessAnalytics: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canProcessDataRequests: boolean;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  issuedAt: number;
  expiresAt: number;
  tokenType: 'access' | 'refresh';
  brazilianUser: boolean;
  lgpdConsent: boolean;
}

// Token blacklist for logout/revocation
const tokenBlacklist = new Set<string>();
const sessionStore = new Map<string, {
  userId: string;
  createdAt: number;
  lastActivity: number;
  ipAddress: string;
  userAgent: string;
  active: boolean;
}>();

/**
 * Advanced JWT Token Manager
 */
export class AdvancedJWTManager {
  private static instance: AdvancedJWTManager;
  private keyRotationInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startKeyRotation();
  }

  public static getInstance(): AdvancedJWTManager {
    if (!AdvancedJWTManager.instance) {
      AdvancedJWTManager.instance = new AdvancedJWTManager();
    }
    return AdvancedJWTManager.instance;
  }

  /**
   * Generate secure access token with LGPD compliance
   */
  public generateAccessToken(
    userId: string,
    email: string,
    role: UserRole,
    ipAddress: string,
    userAgent: string,
    lgpdConsent: boolean = false
  ): string {
    const sessionId = this.generateSessionId();
    const permissions = this.getPermissionsForRole(role);
    const now = Math.floor(Date.now() / 1000);

    const payload: TokenPayload = {
      userId,
      email,
      role,
      permissions,
      sessionId,
      ipAddress: this.hashIP(ipAddress), // Hash IP for privacy
      userAgent: this.hashUserAgent(userAgent), // Hash User-Agent
      issuedAt: now,
      expiresAt: now + this.parseTimeToSeconds(JWT_CONFIG.accessTokenExpiry),
      tokenType: 'access',
      brazilianUser: this.isBrazilianEmail(email),
      lgpdConsent
    };

    // Store session
    sessionStore.set(sessionId, {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ipAddress,
      userAgent,
      active: true
    });

    return jwt.sign(payload, JWT_CONFIG.secret, {
      algorithm: JWT_CONFIG.algorithm,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      expiresIn: JWT_CONFIG.accessTokenExpiry
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token
   */
  public generateRefreshToken(userId: string, sessionId: string): string {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      userId,
      sessionId,
      tokenType: 'refresh',
      issuedAt: now,
      expiresAt: now + this.parseTimeToSeconds(JWT_CONFIG.refreshTokenExpiry)
    };

    return jwt.sign(payload, JWT_CONFIG.secret, {
      algorithm: JWT_CONFIG.algorithm,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      expiresIn: JWT_CONFIG.refreshTokenExpiry
    } as jwt.SignOptions);
  }

  /**
   * Validate and verify JWT token with comprehensive security checks
   */
  public verifyToken(
    token: string,
    expectedType: 'access' | 'refresh' = 'access',
    ipAddress?: string,
    userAgent?: string
  ): TokenPayload | null {
    try {
      // Check token blacklist
      if (tokenBlacklist.has(token)) {
        console.warn('🚨 [AUTH] Blacklisted token used');
        return null;
      }

      // Verify JWT signature and structure
      const decoded = jwt.verify(token, JWT_CONFIG.secret, {
        algorithms: [JWT_CONFIG.algorithm],
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
      }) as TokenPayload;

      // Type validation
      if (decoded.tokenType !== expectedType) {
        console.warn('🚨 [AUTH] Token type mismatch:', decoded.tokenType, 'vs', expectedType);
        return null;
      }

      // Session validation
      const session = sessionStore.get(decoded.sessionId);
      if (!session || !session.active) {
        console.warn('🚨 [AUTH] Invalid or inactive session:', decoded.sessionId);
        return null;
      }

      // IP Address validation (for access tokens)
      if (expectedType === 'access' && ipAddress) {
        const hashedIP = this.hashIP(ipAddress);
        if (decoded.ipAddress !== hashedIP) {
          console.warn('🚨 [AUTH] IP address mismatch - potential token theft');
          this.revokeSession(decoded.sessionId);
          return null;
        }
      }

      // User-Agent validation (basic fingerprinting)
      if (expectedType === 'access' && userAgent) {
        const hashedUA = this.hashUserAgent(userAgent);
        if (decoded.userAgent !== hashedUA) {
          console.warn('🚨 [AUTH] User-Agent mismatch - potential token theft');
          // Don't revoke session immediately for UA changes, but log it
          console.warn('🚨 [AUTH] Expected UA hash:', decoded.userAgent, 'Got:', hashedUA);
        }
      }

      // Update session activity
      session.lastActivity = Date.now();

      return decoded;

    } catch (error: any) {
      console.error('❌ [AUTH] Token verification failed:', error.message);
      return null;
    }
  }

  /**
   * Revoke token by adding to blacklist
   */
  public revokeToken(token: string): void {
    tokenBlacklist.add(token);
    
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      if (decoded?.sessionId) {
        this.revokeSession(decoded.sessionId);
      }
    } catch (error) {
      console.warn('⚠️ [AUTH] Could not decode token for session revocation');
    }
  }

  /**
   * Revoke entire session
   */
  public revokeSession(sessionId: string): void {
    const session = sessionStore.get(sessionId);
    if (session) {
      session.active = false;
      console.log('✅ [AUTH] Session revoked:', sessionId);
    }
  }

  /**
   * Get permissions based on user role
   */
  private getPermissionsForRole(role: UserRole): UserPermissions {
    const basePermissions: UserPermissions = {
      canViewPersonalData: true,
      canExportData: true,
      canDeleteData: true,
      canManageConsents: true,
      canAccessAnalytics: false,
      canManageUsers: false,
      canViewAuditLogs: false,
      canProcessDataRequests: false
    };

    switch (role) {
      case UserRole.ADMIN:
        return {
          ...basePermissions,
          canAccessAnalytics: true,
          canManageUsers: true,
          canViewAuditLogs: true,
          canProcessDataRequests: true
        };

      case UserRole.DPO:
        return {
          ...basePermissions,
          canViewAuditLogs: true,
          canProcessDataRequests: true,
          canAccessAnalytics: true
        };

      case UserRole.SUPPORT:
        return {
          ...basePermissions,
          canProcessDataRequests: true,
          canViewAuditLogs: false
        };

      case UserRole.MARKETING:
        return {
          ...basePermissions,
          canAccessAnalytics: true,
          canManageUsers: false,
          canViewAuditLogs: false
        };

      case UserRole.USER:
      default:
        return basePermissions;
    }
  }

  /**
   * Generate cryptographically secure session ID
   */
  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Hash IP address for privacy (LGPD compliance)
   */
  private hashIP(ipAddress: string): string {
    return createHash('sha256')
      .update(ipAddress + JWT_CONFIG.secret)
      .digest('hex')
      .substring(0, 16); // Truncate for performance
  }

  /**
   * Hash User-Agent for basic fingerprinting
   */
  private hashUserAgent(userAgent: string): string {
    // Extract key components to reduce false positives on minor UA changes
    const simplified = userAgent
      .replace(/\d+\.\d+\.\d+/g, 'X.X.X') // Replace version numbers
      .replace(/\s+/g, ' ')
      .trim();
    
    return createHash('sha256')
      .update(simplified + JWT_CONFIG.secret)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Detect if email belongs to Brazilian user
   */
  private isBrazilianEmail(email: string): boolean {
    const brazilianDomains = ['.br', 'globo.com', 'uol.com.br', 'ig.com.br', 'bol.com.br'];
    return brazilianDomains.some(domain => email.toLowerCase().includes(domain));
  }

  /**
   * Parse time string to seconds
   */
  private parseTimeToSeconds(timeStr: string): number {
    const match = timeStr.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 900;
    }
  }

  /**
   * Start automatic key rotation
   */
  private startKeyRotation(): void {
    if (process.env.NODE_ENV === 'production') {
      this.keyRotationInterval = setInterval(() => {
        this.rotateKeys();
      }, JWT_CONFIG.keyRotationPeriod * 60 * 60 * 1000); // Convert hours to milliseconds
    }
  }

  /**
   * Rotate JWT keys (in production, use external key management)
   */
  private rotateKeys(): void {
    console.log('🔄 [AUTH] Key rotation triggered - implement external key management for production');
    // In production, implement proper key rotation with external key management service
  }

  /**
   * Cleanup expired sessions and tokens
   */
  public cleanup(): void {
    const now = Date.now();
    const maxInactivity = 24 * 60 * 60 * 1000; // 24 hours

    // Clean up inactive sessions
    for (const [sessionId, session] of sessionStore) {
      if (now - session.lastActivity > maxInactivity) {
        sessionStore.delete(sessionId);
        console.log('🧹 [AUTH] Cleaned up inactive session:', sessionId);
      }
    }

    // Clean up token blacklist (keep for 7 days)
    // In production, implement persistent storage with TTL
    console.log('🧹 [AUTH] Token cleanup completed');
  }
}

/**
 * Authentication middleware for API routes
 */
export function createAuthMiddleware(requiredRole?: UserRole, requiredPermission?: keyof UserPermissions) {
  return async function authMiddleware(request: NextRequest): Promise<{
    success: boolean;
    user?: TokenPayload;
    error?: string;
    auditLog: SecurityAuditLog;
  }> {
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      // Extract token from Authorization header
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const auditLog = generateSecurityAuditLog(
          'auth_missing_token',
          null,
          clientIP,
          userAgent,
          'blocked'
        );
        return { success: false, error: 'Token de acesso ausente', auditLog };
      }

      const token = authHeader.substring(7); // Remove 'Bearer '
      
      // Verify token
      const jwtManager = AdvancedJWTManager.getInstance();
      const payload = jwtManager.verifyToken(token, 'access', clientIP, userAgent);
      
      if (!payload) {
        const auditLog = generateSecurityAuditLog(
          'auth_invalid_token',
          null,
          clientIP,
          userAgent,
          'blocked'
        );
        return { success: false, error: 'Token inválido ou expirado', auditLog };
      }

      // Check role requirement
      if (requiredRole && payload.role !== requiredRole && payload.role !== UserRole.ADMIN) {
        const auditLog = generateSecurityAuditLog(
          'auth_insufficient_role',
          payload.userId,
          clientIP,
          userAgent,
          'blocked',
          { required_role: requiredRole, user_role: payload.role }
        );
        return { success: false, error: 'Permissões insuficientes', auditLog };
      }

      // Check specific permission
      if (requiredPermission && !payload.permissions[requiredPermission]) {
        const auditLog = generateSecurityAuditLog(
          'auth_insufficient_permissions',
          payload.userId,
          clientIP,
          userAgent,
          'blocked',
          { required_permission: requiredPermission }
        );
        return { success: false, error: 'Permissão específica ausente', auditLog };
      }

      // Check LGPD consent for Brazilian users
      if (payload.brazilianUser && !payload.lgpdConsent) {
        const auditLog = generateSecurityAuditLog(
          'auth_lgpd_consent_required',
          payload.userId,
          clientIP,
          userAgent,
          'blocked'
        );
        return { success: false, error: 'Consentimento LGPD necessário', auditLog };
      }

      const auditLog = generateSecurityAuditLog(
        'auth_success',
        payload.userId,
        clientIP,
        userAgent,
        'success',
        { role: payload.role, session: payload.sessionId }
      );

      return { success: true, user: payload, auditLog };

    } catch (error: any) {
      const auditLog = generateSecurityAuditLog(
        'auth_error',
        null,
        clientIP,
        userAgent,
        'failure',
        { error: error.message }
      );
      return { success: false, error: 'Erro interno de autenticação', auditLog };
    }
  };
}

/**
 * Password Security Utilities
 */
export class PasswordSecurity {
  private static readonly MIN_LENGTH = 12;
  private static readonly SALT_ROUNDS = 12;

  /**
   * Validate password strength according to Brazilian security standards
   */
  public static validatePassword(password: string): {
    isValid: boolean;
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (password.length < this.MIN_LENGTH) {
      issues.push(`Senha deve ter pelo menos ${this.MIN_LENGTH} caracteres`);
      suggestions.push('Use uma senha mais longa');
    } else {
      score += 20;
    }

    // Character variety
    if (!/[a-z]/.test(password)) {
      issues.push('Senha deve conter letras minúsculas');
      suggestions.push('Adicione letras minúsculas');
    } else {
      score += 15;
    }

    if (!/[A-Z]/.test(password)) {
      issues.push('Senha deve conter letras maiúsculas');
      suggestions.push('Adicione letras maiúsculas');
    } else {
      score += 15;
    }

    if (!/\d/.test(password)) {
      issues.push('Senha deve conter números');
      suggestions.push('Adicione números');
    } else {
      score += 15;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('Senha deve conter caracteres especiais');
      suggestions.push('Adicione símbolos (!@#$%^&*)');
    } else {
      score += 15;
    }

    // Common password check
    const commonPasswords = [
      'password', '123456', 'qwerty', 'abc123', 'admin', 'welcome',
      'senha123', 'brasil123', 'password123'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      issues.push('Senha muito comum');
      suggestions.push('Use uma combinação única e pessoal');
      score -= 30;
    }

    // Sequential patterns
    if (/123456|abcdef|qwerty/i.test(password)) {
      issues.push('Evite sequências previsíveis');
      suggestions.push('Misture caracteres aleatoriamente');
      score -= 20;
    } else {
      score += 10;
    }

    // Repetitive patterns
    if (/(.)\1{2,}/.test(password)) {
      issues.push('Evite repetir o mesmo caractere');
      suggestions.push('Use caracteres variados');
      score -= 15;
    } else {
      score += 10;
    }

    score = Math.max(0, Math.min(100, score));

    return {
      isValid: issues.length === 0 && score >= 70,
      score,
      issues,
      suggestions
    };
  }

  /**
   * Generate secure random password
   */
  public static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const password = Array.from(randomBytes(length))
      .map(byte => charset[byte % charset.length])
      .join('');
    
    return password;
  }
}

// Auto-cleanup on startup and periodic cleanup
const jwtManager = AdvancedJWTManager.getInstance();
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    jwtManager.cleanup();
  }, 60 * 60 * 1000); // Cleanup every hour
}