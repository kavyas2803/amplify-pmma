import { LayoutDashboard, FileStack } from 'lucide-react';
import type { ComponentType } from 'react';

export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'classification', label: 'Classification', path: '/classification', icon: FileStack },
];
