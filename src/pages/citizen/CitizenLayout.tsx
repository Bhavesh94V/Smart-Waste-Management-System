import { Outlet } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { NavItem } from '@/types';
import { 
  LayoutDashboard, 
  Truck, 
  MapPin, 
  History, 
  CreditCard, 
  MessageSquare,
  Trash2
} from 'lucide-react';

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/citizen', icon: LayoutDashboard },
  { title: 'Request Pickup', href: '/citizen/request', icon: Truck },
  { title: 'Track Status', href: '/citizen/track', icon: MapPin },
  { title: 'Bin Status', href: '/citizen/bins', icon: Trash2 },
  { title: 'Pickup History', href: '/citizen/history', icon: History },
  { title: 'Payments', href: '/citizen/payments', icon: CreditCard },
  { title: 'Complaints', href: '/citizen/complaints', icon: MessageSquare },
];

export default function CitizenLayout() {
  return (
    <DashboardLayout navItems={navItems} title="Citizen Portal">
      <Outlet />
    </DashboardLayout>
  );
}
