/**
 * Role-Based Access Control (RBAC) System
 * Manages admin permissions and access control
 */

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user'
}

export enum Resource {
  USERS = 'users',
  DEALS = 'deals',
  DESTINATIONS = 'destinations',
  GUIDES = 'guides',
  ANALYTICS = 'analytics',
  EXPERIMENTS = 'experiments',
  EMAILS = 'emails',
  SYSTEM = 'system',
  AUDIT_LOGS = 'audit_logs'
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  MANAGE = 'manage' // Full control
}

export interface Permission {
  resource: Resource | string
  actions: Action[]
}

/**
 * Default role permissions
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    {
      resource: '*',
      actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT, Action.MANAGE]
    }
  ],

  [Role.ADMIN]: [
    {
      resource: Resource.USERS,
      actions: [Action.READ, Action.UPDATE, Action.EXPORT]
    },
    {
      resource: Resource.DEALS,
      actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]
    },
    {
      resource: Resource.DESTINATIONS,
      actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]
    },
    {
      resource: Resource.GUIDES,
      actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]
    },
    {
      resource: Resource.ANALYTICS,
      actions: [Action.READ, Action.EXPORT]
    },
    {
      resource: Resource.EXPERIMENTS,
      actions: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]
    },
    {
      resource: Resource.EMAILS,
      actions: [Action.CREATE, Action.READ, Action.UPDATE]
    },
    {
      resource: Resource.SYSTEM,
      actions: [Action.READ]
    },
    {
      resource: Resource.AUDIT_LOGS,
      actions: [Action.READ]
    }
  ],

  [Role.MODERATOR]: [
    {
      resource: Resource.USERS,
      actions: [Action.READ]
    },
    {
      resource: Resource.DEALS,
      actions: [Action.READ, Action.UPDATE]
    },
    {
      resource: Resource.DESTINATIONS,
      actions: [Action.READ, Action.UPDATE]
    },
    {
      resource: Resource.GUIDES,
      actions: [Action.READ, Action.UPDATE]
    },
    {
      resource: Resource.ANALYTICS,
      actions: [Action.READ]
    }
  ],

  [Role.USER]: []
}

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(
  role: Role,
  resource: Resource | string,
  action: Action,
  customPermissions?: Permission[]
): boolean {
  // Check custom permissions first
  if (customPermissions) {
    const hasCustom = checkPermissions(customPermissions, resource, action)
    if (hasCustom !== null) return hasCustom
  }

  // Check role-based permissions
  const rolePerms = ROLE_PERMISSIONS[role] || []
  return checkPermissions(rolePerms, resource, action) === true
}

/**
 * Check permissions array
 */
function checkPermissions(
  permissions: Permission[],
  resource: Resource | string,
  action: Action
): boolean | null {
  // Check for wildcard permission
  const wildcardPerm = permissions.find(p => p.resource === '*')
  if (wildcardPerm && wildcardPerm.actions.includes(action)) {
    return true
  }

  // Check specific resource permission
  const resourcePerm = permissions.find(p => p.resource === resource)
  if (resourcePerm) {
    return resourcePerm.actions.includes(action) || resourcePerm.actions.includes(Action.MANAGE)
  }

  return null
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role, customPermissions?: Permission[]): Permission[] {
  const basePermissions = ROLE_PERMISSIONS[role] || []
  return customPermissions ? [...basePermissions, ...customPermissions] : basePermissions
}

/**
 * Check if user is admin (any admin role)
 */
export function isAdmin(role: Role): boolean {
  return [Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR].includes(role)
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(role: Role): boolean {
  return role === Role.SUPER_ADMIN
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
  const names: Record<Role, string> = {
    [Role.SUPER_ADMIN]: 'Super Admin',
    [Role.ADMIN]: 'Admin',
    [Role.MODERATOR]: 'Moderator',
    [Role.USER]: 'User'
  }
  return names[role] || role
}

/**
 * Get role color for UI
 */
export function getRoleColor(role: Role): string {
  const colors: Record<Role, string> = {
    [Role.SUPER_ADMIN]: 'purple',
    [Role.ADMIN]: 'blue',
    [Role.MODERATOR]: 'green',
    [Role.USER]: 'gray'
  }
  return colors[role] || 'gray'
}
