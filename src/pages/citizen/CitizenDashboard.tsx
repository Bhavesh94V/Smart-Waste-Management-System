'use client';

import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge, WasteTypeBadge } from '@/components/ui/status-badge';
import { useState, useEffect } from 'react';
import { citizenAPI } from '@/services/api';
import { PickupRequest } from '@/types';
import {
  Truck,
  Clock,
  CheckCircle,
  Calendar,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response: any = await citizenAPI.getPickupRequests(undefined, 1, 10);

        // Backend returns: { success: true, data: { total, page, pages, items: [...] } }
        const requests = response?.data?.items || [];
        setPickupRequests(requests);
      } catch (err: any) {
        console.error('Dashboard load error:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const activeRequests = pickupRequests.filter(r =>
    !['verified', 'completed', 'cancelled'].includes(r.requestStatus)
  );

  const completedRequests = pickupRequests.filter(r =>
    ['verified', 'completed'].includes(r.requestStatus)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-balance">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {"Here's an overview of your pickup activity"}
          </p>
        </div>

        <Button asChild size="lg">
          <Link to="/citizen/request">
            <Truck className="w-4 h-4 mr-2" />
            Request Pickup
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Active Requests"
          value={activeRequests.length}
          icon={Clock}
          description="Pending pickups"
        />

        <StatCard
          title="Completed"
          value={completedRequests.length}
          icon={CheckCircle}
          description="Finished pickups"
        />

        <StatCard
          title="Next Pickup"
          value={
            activeRequests.length > 0 && activeRequests[0].scheduledDate
              ? format(new Date(activeRequests[0].scheduledDate), 'MMM d')
              : 'None'
          }
          icon={Calendar}
          description={
            activeRequests.length > 0 && activeRequests[0].preferredTimeSlot
              ? activeRequests[0].preferredTimeSlot
              : 'Schedule one now'
          }
        />
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Your latest pickup requests</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/citizen/history">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          {pickupRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pickup requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pickupRequests.slice(0, 5).map(request => (
                <Link
                  key={request.id}
                  to={`/citizen/track/${request.id}`}
                  className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <WasteTypeBadge type={request.wasteType} />
                        <StatusBadge status={request.requestStatus} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {request.pickupAddress}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.createdAt), 'PPP')}
                        {request.preferredTimeSlot && ` - ${request.preferredTimeSlot}`}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
