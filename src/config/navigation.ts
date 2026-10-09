import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CircleCheck,
  Forward,
  LayoutDashboard,
  ListTodo,
  PlusSquare,
  Shield,
  Target,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export const superAdminNavItem: NavItem = {
  label: 'Super Admin',
  path: '/super-admin',
  icon: Shield,
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Add Task', path: '/add-task', icon: PlusSquare },
  { label: 'Task Tracker', path: '/tracker', icon: ListTodo },
  { label: 'Forwarded Tasks', path: '/forwarded', icon: Forward },
  { label: 'Completed', path: '/completed', icon: CircleCheck },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Focus Mode', path: '/focus', icon: Target },
]
