import { Outlet } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { NavItem } from '@/types';
import { LayoutDashboard, MapPin, ClipboardList, CheckSquare, Truck } from 'lucide-react';

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/collector', icon: LayoutDashboard },
  { title: 'Assigned Routes', href: '/collector/routes', icon: MapPin },
  { title: 'Pickup Requests', href: '/collector/requests', icon: ClipboardList },
  { title: 'Daily Tasks', href: '/collector/tasks', icon: CheckSquare },
];

export default function CollectorLayout() {
  return (
    <DashboardLayout navItems={navItems} title="Collector Portal">
      <Outlet />
    </DashboardLayout>
  );
}
