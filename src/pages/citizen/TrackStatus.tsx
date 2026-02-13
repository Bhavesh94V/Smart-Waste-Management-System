'use client';

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, WasteTypeBadge } from '@/components/ui/status-badge';
import { StatusStepper } from '@/components/ui/status-stepper';
import { Spinner } from '@/components/ui/spinner';
import { citizenAPI } from '@/services/api';
import { PickupRequest } from '@/types';
import { 
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Calendar,
  Clock,
  CreditCard,
  Truck,
  Package,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function TrackStatus() {
  const { user } = useAuth();
  const { requestId } = useParams();
  const [activeRequests, setActiveRequests] = useState<PickupRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true);
        const response: any = await citizenAPI.getPickupRequests(undefined, 1, 50);
        // Backend returns: { success: true, data: { total, page, pages, items: [...] } }
        const requests: PickupRequest[] = response?.data?.items || [];
        const active = requests.filter((r) => !['cancelled'].includes(r.requestStatus));
        setActiveRequests(active);
        
        if (requestId) {
          const selected = requests.find((r) => r.id === requestId);
          setSelectedRequest(selected || null);
        } else if (active.length > 0) {
          setSelectedRequest(active[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load requests');
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [requestId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button asChild>
          <Link to="/citizen">Go back</Link>
        </Button>
      </div>
    );
  }

  if (!selectedRequest && requestId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Request not found</p>
        <Button asChild variant="link">
          <Link to="/citizen/track">View all requests</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {requestId && (
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/citizen/track">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all requests
          </Link>
        </Button>
      )}

      {activeRequests.length === 0 && !requestId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Active Requests</h3>
            <p className="text-muted-foreground mb-4">
              {"You don't have any ongoing pickup requests"}
            </p>
            <Button asChild>
              <Link to="/citizen/request">Request Pickup</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Request list (if not viewing specific) */}
          {!requestId && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Active Requests</CardTitle>
                <CardDescription>{activeRequests.length} ongoing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeRequests.map((request) => (
                  <Link
                    key={request.id}
                    to={`/citizen/track/${request.id}`}
                    className={`block p-3 rounded-lg border transition-colors ${
                      selectedRequest?.id === request.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <WasteTypeBadge type={request.wasteType} />
                      <StatusBadge status={request.requestStatus} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.pickupAddress}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(request.createdAt), 'PP')}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Selected request details */}
          {selectedRequest && (
            <Card className={requestId ? 'lg:col-span-3' : 'lg:col-span-2'}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Request Details
                    </CardTitle>
                    <CardDescription>
                      Created {format(new Date(selectedRequest.createdAt), 'PPP')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <WasteTypeBadge type={selectedRequest.wasteType} />
                    <StatusBadge status={selectedRequest.requestStatus} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status stepper */}
                <div className="py-4">
                  <StatusStepper currentStatus={selectedRequest.requestStatus} />
                </div>

                {/* Details grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Pickup Details
                    </h4>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary mt-1" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{selectedRequest.pickupAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Package className="w-4 h-4 text-primary mt-1" />
                      <div>
                        <p className="text-sm font-medium">Quantity</p>
                        <p className="text-sm text-muted-foreground">{selectedRequest.wasteQuantity} kg</p>
                      </div>
                    </div>

                    {selectedRequest.scheduledDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-primary mt-1" />
                        <div>
                          <p className="text-sm font-medium">Scheduled Date</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(selectedRequest.scheduledDate), 'PPP')}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRequest.preferredTimeSlot && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-primary mt-1" />
                        <div>
                          <p className="text-sm font-medium">Time Slot</p>
                          <p className="text-sm text-muted-foreground">{selectedRequest.preferredTimeSlot}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedRequest.collector && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Assigned Collector
                      </h4>
                      
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-primary mt-1" />
                        <div>
                          <p className="text-sm font-medium">
                            {selectedRequest.collector.firstName} {selectedRequest.collector.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">Waste Collector</p>
                        </div>
                      </div>

                      {selectedRequest.collector.phoneNumber && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-primary mt-1" />
                          <div>
                            <p className="text-sm font-medium">Contact</p>
                            <p className="text-sm text-muted-foreground">{selectedRequest.collector.phoneNumber}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment section if collected or verified */}
                {(selectedRequest.requestStatus === 'collected' || selectedRequest.requestStatus === 'verified') && selectedRequest.estimatedServiceCharge && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <span className="font-semibold">
                          {selectedRequest.requestStatus === 'collected' ? 'Payment Pending' : 'Payment Required'}
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {'\u20B9'}{selectedRequest.estimatedServiceCharge}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedRequest.requestStatus === 'collected' 
                        ? 'Your waste has been collected. Please complete the payment.'
                        : 'Collection verified. Please complete the payment to finish this request.'}
                    </p>
                    <Button asChild className="w-full">
                      <Link to={`/citizen/payments?pickupRequestId=${selectedRequest.id}`}>
                        Proceed to Payment
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Completed section */}
                {selectedRequest.requestStatus === 'completed' && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Request Completed</span>
                    </div>
                    <p className="text-sm text-green-700">
                      This pickup request has been completed. Payment has been received. Thank you!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
