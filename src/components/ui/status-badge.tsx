import { cn } from '@/lib/utils';
import { PickupStatus, WasteType } from '@/types';

interface StatusBadgeProps {
  status: PickupStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    assigned: { label: 'Assigned', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    accepted: { label: 'Accepted', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
    in_transit: { label: 'In Transit', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    collected: { label: 'Collected', className: 'bg-teal-100 text-teal-800 border-teal-200' },
    verified: { label: 'Verified', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}

interface WasteTypeBadgeProps {
  type: WasteType;
  className?: string;
}

export function WasteTypeBadge({ type, className }: WasteTypeBadgeProps) {
  const typeConfig: Record<string, { label: string; className: string }> = {
    biodegradable: { label: 'Biodegradable', className: 'bg-green-100 text-green-800 border-green-200' },
    recyclable: { label: 'Recyclable', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    hazardous: { label: 'Hazardous', className: 'bg-red-100 text-red-800 border-red-200' },
    mixed: { label: 'Mixed', className: 'bg-purple-100 text-purple-800 border-purple-200' },
    'e-waste': { label: 'E-Waste', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    other: { label: 'Other', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  const config = typeConfig[type] || { label: type, className: 'bg-gray-100 text-gray-800 border-gray-200' };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}

// Payment status badge
interface PaymentStatusBadgeProps {
  status: string;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    initiated: { label: 'Initiated', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    processing: { label: 'Processing', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-800 border-red-200' },
    refunded: { label: 'Refunded', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
