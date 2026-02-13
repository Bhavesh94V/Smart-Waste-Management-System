import { Outlet } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { NavItem } from '@/types';
import { LayoutDashboard, Users, UserCog, Truck, Trash2, BarChart3, CreditCard, Settings, MessageSquare } from 'lucide-react';

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'User Management', href: '/admin/users', icon: Users },
  { title: 'Collector Assignment', href: '/admin/assignments', icon: UserCog },
  { title: 'Bin Monitoring', href: '/admin/bins', icon: Trash2 },
  { title: 'Complaints', href: '/admin/complaints', icon: MessageSquare },
  { title: 'AI Reports', href: '/admin/reports', icon: BarChart3 },
  { title: 'Payments', href: '/admin/payments', icon: CreditCard },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  return (
    <DashboardLayout navItems={navItems} title="Admin Portal">
      <Outlet />
    </DashboardLayout>
  );
}
