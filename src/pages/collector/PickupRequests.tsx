'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, WasteTypeBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, MapPin, Phone, Calendar, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { collectorAPI } from '@/services/api';
import { PickupRequest } from '@/types';

export default function PickupRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableRequests, setAvailableRequests] = useState<PickupRequest[]>([]);
  const [assignedRequests, setAssignedRequests] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const [availableRes, assignedRes]: any[] = await Promise.all([
        collectorAPI.getAvailableRequests(1, 50),
        collectorAPI.getAssignedRequests(1, 50),
      ]);

      const available = availableRes?.data?.items || [];
      const assigned = assignedRes?.data?.items || [];

      setAvailableRequests(available.filter((r: PickupRequest) => r.requestStatus === 'pending'));
      setAssignedRequests(assigned);
    } catch (err: any) {
      console.error('Failed to load requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await collectorAPI.acceptRequest(requestId);
      toast({ title: 'Request accepted successfully' });
      await loadRequests();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await collectorAPI.rejectRequest(requestId);
      toast({ title: 'Request rejected' });
      await loadRequests();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkInTransit = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await collectorAPI.markInTransit(requestId);
      toast({ title: 'Marked as in transit' });
      await loadRequests();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCollected = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await collectorAPI.markCollected(requestId);
      toast({ title: 'Marked as collected' });
      await loadRequests();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const allRequests = [...availableRequests, ...assignedRequests];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pickup Requests</h1>
          <p className="text-muted-foreground mt-1">Manage incoming and assigned pickup requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadRequests}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">New Requests</p>
            <p className="text-3xl font-bold text-yellow-700">
              {availableRequests.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Assigned / Accepted</p>
            <p className="text-3xl font-bold text-blue-700">
              {assignedRequests.filter(r => r.requestStatus === 'assigned' || r.requestStatus === 'accepted').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">In Transit</p>
            <p className="text-3xl font-bold text-orange-700">
              {assignedRequests.filter(r => r.requestStatus === 'in_transit').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Collected</p>
            <p className="text-3xl font-bold text-green-700">
              {assignedRequests.filter(r => r.requestStatus === 'collected' || r.requestStatus === 'verified' || r.requestStatus === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Request Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allRequests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <div className={`h-1 ${
              request.requestStatus === 'pending' ? 'bg-yellow-500' :
              request.requestStatus === 'assigned' ? 'bg-blue-500' :
              request.requestStatus === 'accepted' ? 'bg-indigo-500' :
              request.requestStatus === 'in_transit' ? 'bg-orange-500' :
              request.requestStatus === 'collected' || request.requestStatus === 'verified' || request.requestStatus === 'completed' ? 'bg-green-500' : 'bg-muted'
            }`} />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {request.citizen?.firstName} {request.citizen?.lastName}
                </CardTitle>
                <StatusBadge status={request.requestStatus} />
              </div>
              <CardDescription className="font-mono text-xs">{request.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{request.pickupAddress}</span>
              </div>
              {request.citizen?.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{request.citizen.phoneNumber}</span>
                </div>
              )}
              {request.scheduledDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{format(new Date(request.scheduledDate), 'MMM d, yyyy')}</span>
                  {request.preferredTimeSlot && (
                    <>
                      <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                      <span>{request.preferredTimeSlot}</span>
                    </>
                  )}
                </div>
              )}
              <div className="pt-2">
                <WasteTypeBadge type={request.wasteType} />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t">
                {request.requestStatus === 'pending' && (
                  <>
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => handleAccept(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><Check className="w-4 h-4 mr-1" /> Accept</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      size="sm"
                      onClick={() => handleReject(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </>
                )}
                {request.requestStatus === 'assigned' && (
                  <div className="flex gap-2 flex-1">
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => handleAccept(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><Check className="w-4 h-4 mr-1" /> Accept</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      size="sm"
                      onClick={() => handleReject(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
                {request.requestStatus === 'accepted' && (
                  <Button
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    size="sm"
                    onClick={() => handleMarkInTransit(request.id)}
                    disabled={actionLoading === request.id}
                  >
                    {actionLoading === request.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Mark In Transit'
                    )}
                  </Button>
                )}
                {request.requestStatus === 'in_transit' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                    onClick={() => handleMarkCollected(request.id)}
                    disabled={actionLoading === request.id}
                  >
                    {actionLoading === request.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><Check className="w-4 h-4 mr-1" /> Mark Collected</>
                    )}
                  </Button>
                )}
                {(request.requestStatus === 'collected' || request.requestStatus === 'verified' || request.requestStatus === 'completed') && (
                  <div className="flex-1 text-center text-sm text-green-600 font-medium py-2">
                    Completed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {allRequests.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No pickup requests available</p>
        </Card>
      )}
    </div>
  );
}
