import {
  User,
  TestTube,
  Shield,
  Crown,
  Gem,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'

export interface RoleConfig {
  label: string
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
  description: string
  priority: number
}

export const ROLE_CONFIG: Record<string, RoleConfig> = {
  user: {
    label: 'User',
    icon: User,
    color: 'text-slate-300',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30',
    description: 'Regular user with basic permissions',
    priority: 1,
  },
  tester: {
    label: 'Beta Tester',
    icon: TestTube,
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    description: 'Beta tester with access to new features',
    priority: 2,
  },
  moderator: {
    label: 'Moderator',
    icon: Shield,
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    description: 'Content moderator with moderation permissions',
    priority: 3,
  },
  admin: {
    label: 'Administrator',
    icon: Crown,
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    description: 'Full system administrator with all permissions',
    priority: 4,
  },
  owner: {
    label: 'Owner',
    icon: Gem,
    color: 'text-yellow-300',
    bgColor: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-500/40',
    description: 'System owner with highest access level',
    priority: 5,
  },
}

export const getRoleConfig = (roleName: string): RoleConfig => {
  const normalizedRole = roleName.toLowerCase()
  return ROLE_CONFIG[normalizedRole] || {
    label: roleName.charAt(0).toUpperCase() + roleName.slice(1),
    icon: ShieldAlert,
    color: 'text-slate-300',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30',
    description: 'Custom role',
    priority: 0,
  }
}

export const getRoleIcon = (roleName: string, className: string = 'h-4 w-4') => {
  const config = getRoleConfig(roleName)
  const IconComponent = config.icon
  return { IconComponent, className: `${className} ${config.color}` }
}

export const getRoleBadgeClasses = (roleName: string): string => {
  const config = getRoleConfig(roleName)
  return `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${config.bgColor} ${config.color} ${config.borderColor}`
}

export const getRoleCardClasses = (roleName: string): string => {
  const config = getRoleConfig(roleName)
  return `w-12 h-12 rounded-xl flex items-center justify-center ${config.bgColor}`
}

export const getRoleGradientClasses = (roleName: string): string => {
  const config = getRoleConfig(roleName)
  if (roleName.toLowerCase() === 'owner') {
    return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 shadow-lg shadow-yellow-500/10'
  }
  return config.bgColor
}
