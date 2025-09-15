'use client'

import { useState, useCallback, useEffect } from 'react'
import { SimpleProxy as Proxy } from '@/types/proxy'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'manager' | 'user' | 'viewer'
  organizationId: string
  permissions: Permission[]
  lastActive: number
  createdAt: number
  isActive: boolean
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  plan: 'free' | 'pro' | 'enterprise'
  limits: {
    maxUsers: number
    maxProxies: number
    maxTests: number
    maxStorage: number // in MB
  }
  usage: {
    users: number
    proxies: number
    tests: number
    storage: number
  }
  settings: {
    allowUserInvites: boolean
    requireApproval: boolean
    enableAuditLog: boolean
    retentionDays: number
  }
  createdAt: number
  isActive: boolean
}

export interface Permission {
  resource: 'proxies' | 'users' | 'settings' | 'billing' | 'analytics'
  actions: ('create' | 'read' | 'update' | 'delete' | 'export')[]
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  organizationId: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: number
}

export interface Invitation {
  id: string
  organizationId: string
  email: string
  role: User['role']
  invitedBy: string
  invitedAt: number
  expiresAt: number
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
}

const DEFAULT_PERMISSIONS: Record<User['role'], Permission[]> = {
  admin: [
    {
      resource: 'proxies',
      actions: ['create', 'read', 'update', 'delete', 'export']
    },
    {
      resource: 'users',
      actions: ['create', 'read', 'update', 'delete']
    },
    {
      resource: 'settings',
      actions: ['read', 'update']
    },
    {
      resource: 'billing',
      actions: ['read', 'update']
    },
    {
      resource: 'analytics',
      actions: ['read', 'export']
    }
  ],
  manager: [
    {
      resource: 'proxies',
      actions: ['create', 'read', 'update', 'delete', 'export']
    },
    {
      resource: 'users',
      actions: ['read']
    },
    {
      resource: 'analytics',
      actions: ['read', 'export']
    }
  ],
  user: [
    {
      resource: 'proxies',
      actions: ['create', 'read', 'update', 'delete']
    },
    {
      resource: 'analytics',
      actions: ['read']
    }
  ],
  viewer: [
    {
      resource: 'proxies',
      actions: ['read']
    },
    {
      resource: 'analytics',
      actions: ['read']
    }
  ]
}

export function useMultiTenant() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Initialize demo data
  useEffect(() => {
    // Create demo organization
    const demoOrg: Organization = {
      id: 'org_demo',
      name: 'Demo Organization',
      slug: 'demo-org',
      plan: 'pro',
      limits: {
        maxUsers: 10,
        maxProxies: 1000,
        maxTests: 10000,
        maxStorage: 1024
      },
      usage: {
        users: 3,
        proxies: 150,
        tests: 2500,
        storage: 256
      },
      settings: {
        allowUserInvites: true,
        requireApproval: false,
        enableAuditLog: true,
        retentionDays: 90
      },
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      isActive: true
    }

    // Create demo user
    const demoUser: User = {
      id: 'user_demo',
      email: 'admin@demo.com',
      name: 'Demo Admin',
      role: 'admin',
      organizationId: demoOrg.id,
      permissions: DEFAULT_PERMISSIONS.admin,
      lastActive: Date.now(),
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      isActive: true
    }

    setCurrentOrganization(demoOrg)
    setCurrentUser(demoUser)
    setOrganizations([demoOrg])
    setUsers([demoUser])
  }, [])

  // Check permissions
  const hasPermission = useCallback((resource: Permission['resource'], action: Permission['actions'][0]) => {
    if (!currentUser) return false
    
    const permission = currentUser.permissions.find(p => p.resource === resource)
    return permission?.actions.includes(action) || false
  }, [currentUser])

  // Log audit event
  const logAuditEvent = useCallback((
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>
  ) => {
    if (!currentUser || !currentOrganization?.settings.enableAuditLog) return

    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      organizationId: currentOrganization.id,
      action,
      resource,
      resourceId,
      details: details || {},
      ipAddress: '127.0.0.1', // In real app, get from request
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    }

    setAuditLogs(prev => [auditLog, ...prev.slice(0, 999)]) // Keep last 1000 logs
  }, [currentUser, currentOrganization])

  // Invite user
  const inviteUser = useCallback(async (email: string, role: User['role']) => {
    if (!hasPermission('users', 'create')) {
      throw new Error('Insufficient permissions to invite users')
    }

    if (!currentOrganization) {
      throw new Error('No organization selected')
    }

    // Check limits
    if (users.length >= currentOrganization.limits.maxUsers) {
      throw new Error('User limit reached for current plan')
    }

    setIsLoading(true)
    try {
      const invitation: Invitation = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        organizationId: currentOrganization.id,
        email,
        role,
        invitedBy: currentUser!.id,
        invitedAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        status: 'pending'
      }

      setInvitations(prev => [...prev, invitation])
      logAuditEvent('invite_user', 'users', undefined, { email, role })

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000))

      return invitation
    } finally {
      setIsLoading(false)
    }
  }, [hasPermission, currentOrganization, users.length, currentUser, logAuditEvent])

  // Update user role
  const updateUserRole = useCallback(async (userId: string, newRole: User['role']) => {
    if (!hasPermission('users', 'update')) {
      throw new Error('Insufficient permissions to update users')
    }

    setIsLoading(true)
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, permissions: DEFAULT_PERMISSIONS[newRole] }
          : user
      ))

      logAuditEvent('update_user_role', 'users', userId, { newRole })
      
      await new Promise(resolve => setTimeout(resolve, 500))
    } finally {
      setIsLoading(false)
    }
  }, [hasPermission, logAuditEvent])

  // Remove user
  const removeUser = useCallback(async (userId: string) => {
    if (!hasPermission('users', 'delete')) {
      throw new Error('Insufficient permissions to remove users')
    }

    if (userId === currentUser?.id) {
      throw new Error('Cannot remove yourself')
    }

    setIsLoading(true)
    try {
      const user = users.find(u => u.id === userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      
      logAuditEvent('remove_user', 'users', userId, { userName: user?.name })
      
      await new Promise(resolve => setTimeout(resolve, 500))
    } finally {
      setIsLoading(false)
    }
  }, [hasPermission, currentUser, users, logAuditEvent])

  // Update organization settings
  const updateOrganizationSettings = useCallback(async (settings: Partial<Organization['settings']>) => {
    if (!hasPermission('settings', 'update')) {
      throw new Error('Insufficient permissions to update settings')
    }

    if (!currentOrganization) return

    setIsLoading(true)
    try {
      const updatedOrg = {
        ...currentOrganization,
        settings: { ...currentOrganization.settings, ...settings }
      }

      setCurrentOrganization(updatedOrg)
      setOrganizations(prev => prev.map(org => 
        org.id === updatedOrg.id ? updatedOrg : org
      ))

      logAuditEvent('update_organization_settings', 'settings', currentOrganization.id, settings)
      
      await new Promise(resolve => setTimeout(resolve, 500))
    } finally {
      setIsLoading(false)
    }
  }, [hasPermission, currentOrganization, logAuditEvent])

  // Get filtered proxies for current user
  const getFilteredProxies = useCallback((allProxies: Proxy[]) => {
    // In a real implementation, this would filter based on user permissions and organization
    return allProxies
  }, [])

  // Get usage statistics
  const getUsageStats = useCallback(() => {
    if (!currentOrganization) return null

    const { usage, limits } = currentOrganization

    return {
      users: {
        current: usage.users,
        limit: limits.maxUsers,
        percentage: (usage.users / limits.maxUsers) * 100
      },
      proxies: {
        current: usage.proxies,
        limit: limits.maxProxies,
        percentage: (usage.proxies / limits.maxProxies) * 100
      },
      tests: {
        current: usage.tests,
        limit: limits.maxTests,
        percentage: (usage.tests / limits.maxTests) * 100
      },
      storage: {
        current: usage.storage,
        limit: limits.maxStorage,
        percentage: (usage.storage / limits.maxStorage) * 100
      }
    }
  }, [currentOrganization])

  // Get recent activity
  const getRecentActivity = useCallback((limit: number = 10) => {
    return auditLogs.slice(0, limit)
  }, [auditLogs])

  // Check if feature is available for current plan
  const isFeatureAvailable = useCallback((feature: string) => {
    if (!currentOrganization) return false

    const planFeatures = {
      free: ['basic_proxies', 'basic_testing'],
      pro: ['basic_proxies', 'basic_testing', 'advanced_analytics', 'team_collaboration'],
      enterprise: ['basic_proxies', 'basic_testing', 'advanced_analytics', 'team_collaboration', 'custom_integrations', 'priority_support']
    }

    return planFeatures[currentOrganization.plan].includes(feature)
  }, [currentOrganization])

  return {
    // State
    currentUser,
    currentOrganization,
    users,
    organizations,
    auditLogs,
    invitations,
    isLoading,

    // Actions
    hasPermission,
    inviteUser,
    updateUserRole,
    removeUser,
    updateOrganizationSettings,
    getFilteredProxies,
    logAuditEvent,

    // Utils
    getUsageStats,
    getRecentActivity,
    isFeatureAvailable
  }
}
