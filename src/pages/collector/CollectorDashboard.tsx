'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge, WasteTypeBadge } from '@/components/ui/status-badge';
import { Spinner } from '@/components/ui/spinner';
import { collectorAPI } from '@/services/api';
import { Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function CollectorDashboard() {
  const { user } = useAuth();
  const [assignedRequests, setAssignedRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const response: any = await collectorAPI.getAssignedRequests();
        const requests = response?.data?.items || [];

        setAssignedRequests(requests);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const pending = assignedRequests.filter(
    (r) => r.requestStatus === 'assigned'
  );

  const completed = assignedRequests.filter(
    (r) =>
      r.requestStatus === 'collected' ||
      r.requestStatus === 'verified' ||
      r.requestStatus === 'completed'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.firstName}! 🚛
          </h1>
          <p className="text-muted-foreground">
            Here's your work overview
          </p>
        </div>

        <Button asChild>
          <Link to="/collector/routes">
            <MapPin className="w-4 h-4 mr-2" />
            View Assigned Requests
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Assigned"
          value={assignedRequests.length}
          icon={Truck}
        />

        <StatCard
          title="Pending"
          value={pending.length}
          icon={Clock}
        />

        <StatCard
          title="Completed"
          value={completed.length}
          icon={CheckCircle}
        />
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assigned Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No assigned requests
            </p>
          ) : (
            <div className="space-y-3">
              {assignedRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex justify-between mb-2">
                    <WasteTypeBadge type={req.wasteType} />
                    <StatusBadge status={req.requestStatus} />
                  </div>

                  <p className="font-medium">
                    {req.citizen?.firstName} {req.citizen?.lastName}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {req.pickupAddress}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
