import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleRedirect from "@/components/RoleRedirect";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Citizen pages
import CitizenLayout from "@/pages/citizen/CitizenLayout";
import CitizenDashboard from "@/pages/citizen/CitizenDashboard";
import RequestPickup from "@/pages/citizen/RequestPickup";
import TrackStatus from "@/pages/citizen/TrackStatus";
import BinStatus from "@/pages/citizen/BinStatus";
import PickupHistory from "@/pages/citizen/PickupHistory";
import Payments from "@/pages/citizen/Payments";
import Complaints from "@/pages/citizen/Complaints";

// Collector pages
import CollectorLayout from "@/pages/collector/CollectorLayout";
import CollectorDashboard from "@/pages/collector/CollectorDashboard";
import AssignedRoutes from "@/pages/collector/AssignedRoutes";
import PickupRequests from "@/pages/collector/PickupRequests";
import DailyTasks from "@/pages/collector/DailyTasks";

// Admin pages
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import CollectorAssignment from "@/pages/admin/CollectorAssignment";
import BinMonitoring from "@/pages/admin/BinMonitoring";
import AIReports from "@/pages/admin/AIReports";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminComplaints from "@/pages/admin/AdminComplaints";
import SystemSettings from "@/pages/admin/SystemSettings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Root redirect based on role */}
            <Route path="/" element={<RoleRedirect />} />
            
            {/* Citizen routes */}
            <Route path="/citizen" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenLayout />
              </ProtectedRoute>
            }>
              <Route index element={<CitizenDashboard />} />
              <Route path="request" element={<RequestPickup />} />
              <Route path="track" element={<TrackStatus />} />
              <Route path="track/:requestId" element={<TrackStatus />} />
              <Route path="bins" element={<BinStatus />} />
              <Route path="history" element={<PickupHistory />} />
              <Route path="payments" element={<Payments />} />
              <Route path="complaints" element={<Complaints />} />
            </Route>
            
            {/* Collector routes */}
            <Route path="/collector" element={
              <ProtectedRoute allowedRoles={['collector']}>
                <CollectorLayout />
              </ProtectedRoute>
            }>
              <Route index element={<CollectorDashboard />} />
              <Route path="routes" element={<AssignedRoutes />} />
              <Route path="requests" element={<PickupRequests />} />
              <Route path="tasks" element={<DailyTasks />} />
            </Route>
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="assignments" element={<CollectorAssignment />} />
              <Route path="bins" element={<BinMonitoring />} />
              <Route path="complaints" element={<AdminComplaints />} />
              <Route path="reports" element={<AIReports />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
