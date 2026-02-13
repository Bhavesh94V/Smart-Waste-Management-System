// User and Auth Types
export type UserRole = 'citizen' | 'collector' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status?: 'active' | 'inactive' | 'suspended';
  isOnline?: boolean;
  profileImage?: string;
  documentsVerified?: boolean;
  collectorType?: 'individual' | 'organization';
  collectorLicense?: string;
  collectorVehicleType?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WasteType =
  | 'biodegradable'
  | 'recyclable'
  | 'hazardous'
  | 'mixed'
  | 'e-waste'
  | 'other';

// Pickup Request Status
export type PickupStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'rejected'
  | 'in_transit'
  | 'collected'
  | 'verified'
  | 'completed'
  | 'cancelled';

export type TimeSlot = '8AM-11AM' | '11AM-2PM' | '2PM-5PM' | '5PM-8PM';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface PickupRequest {
  id: string;
  citizenId: string;
  collectorId?: string | null;

  wasteType: WasteType;
  wasteQuantity: number;
  description?: string;

  pickupAddress: string;
  pickupLatitude?: number | null;
  pickupLongitude?: number | null;

  scheduledDate: string;
  preferredTimeSlot: TimeSlot;

  requestStatus: PickupStatus;
  priority: Priority;

  estimatedServiceCharge?: number | null;
  imageProof?: string[] | null;
  notes?: string | null;

  collectorAcceptanceTime?: string | null;
  collectionTime?: string | null;
  verificationTime?: string | null;
  verificationNotes?: string | null;

  cancellationReason?: string | null;
  cancelledBy?: 'citizen' | 'collector' | 'admin' | null;

  // Nested associations from backend
  citizen?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
  };
  collector?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  } | null;

  payment?: Payment | null;

  createdAt: string;
  updatedAt: string;
}

// Bin Types
export type BinStatus = 'empty' | 'half' | 'full';

export interface Bin {
  id: string;
  location: string;
  fillLevel: number; // 0-100
  status: BinStatus;
  wasteType: WasteType;
  lastCollected?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Collector Types
export interface CollectorRoute {
  id: string;
  collectorId: string;
  date: string;
  pickups: PickupRequest[];
  bins: Bin[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface DailyTask {
  id: string;
  collectorId: string;
  date: string;
  totalPickups: number;
  completedPickups: number;
  totalBins: number;
  completedBins: number;
}

// Complaint Types
export type ComplaintCategory =
  | 'missed_pickup'
  | 'bin_overflow'
  | 'improper_disposal'
  | 'collector_behavior'
  | 'other';

export type ComplaintStatus = 'submitted' | 'in_review' | 'resolved';

export interface Complaint {
  id: string;
  citizenId: string;
  citizenName: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  resolvedAt?: string;
}

// Payment Types
export type PaymentStatus =
  | 'pending'
  | 'initiated'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'upi'
  | 'bank_transfer'
  | 'wallet'
  | 'cash_on_collection';

export interface Payment {
  id: string;
  pickupRequestId: string;
  citizenId: string;
  serviceCharge: number;
  tax: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  transactionId?: string | null;
  paymentGateway?: string | null;
  paymentReference?: string | null;
  invoiceNumber: string;
  invoiceDate: string;
  paidAt?: string | null;
  paymentNotes?: string | null;
  failureReason?: string | null;
  refundAmount?: number | null;
  refundedAt?: string | null;
  refundReason?: string | null;
  receiptUrl?: string | null;
  pickupRequest?: {
    id: string;
    wasteType: WasteType;
    wasteQuantity: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Paginated response from backend
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pages: number;
  items: T[];
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Dashboard Stats (from admin/dashboard-stats)
export interface DashboardStats {
  totalUsers: number;
  activeCollectors: number;
  pendingRequests: number;
  recycledPercentage: number;
}

// Waste Analytics (from admin/analytics/waste)
export interface WasteAnalytics {
  dryWaste: number;
  wetWaste: number;
  hazardousWaste: number;
  totalCollections: number;
  totalWeight: number;
  fullBins: number;
  activeCitizens: number;
  weeklyData?: { day: string; dry: number; wet: number; hazardous: number }[];
  monthlyData?: { month: string; collections: number; recycled: number }[];
}

// Analytics Types (kept for backward compatibility)
export interface WasteStats {
  totalCollections: number;
  dryWaste: number;
  wetWaste: number;
  hazardousWaste: number;
  totalWeight: number;
  recycledPercentage: number;
}

export interface CollectorPerformance {
  collectorId: string;
  collectorName: string;
  totalPickups: number;
  completedPickups: number;
  averageRating: number;
  efficiency: number;
}

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}
