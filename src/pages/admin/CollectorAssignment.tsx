'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, WasteTypeBadge } from '@/components/ui/status-badge';
import { adminAPI } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import { UserCog, Check, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PickupRequest, User } from '@/types';

export default function CollectorAssignment() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [collectors, setCollectors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [requestsRes, usersRes]: any[] = await Promise.all([
        adminAPI.getAllPickupRequests(undefined, 1, 100),
        adminAPI.getUsers('collector', 1, 100),
      ]);

      setRequests(requestsRes?.data?.items || []);
      setCollectors(usersRes?.data?.items || []);
    } catch (err: any) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingRequests = requests.filter(r => r.requestStatus === 'pending');
  const assignedRequests = requests.filter(r => 
    r.requestStatus === 'assigned' || r.requestStatus === 'accepted' || r.requestStatus === 'in_transit'
  );
  const collectedRequests = requests.filter(r => r.requestStatus === 'collected');
  const verifiedRequests = requests.filter(r => r.requestStatus === 'verified');

  const handleVerify = async (requestId: string) => {
    try {
      setAssignLoading(requestId);
      await adminAPI.verifyCollection(requestId, 'Verified by admin');
      toast({ title: 'Collection verified successfully' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAssignLoading(null);
    }
  };

  const handleAssign = async (requestId: string, collectorId: string) => {
    try {
      setAssignLoading(requestId);
      await adminAPI.assignPickupRequest(requestId, collectorId);
      const collector = collectors.find(c => c.id === collectorId);
      toast({ title: `Request assigned to ${collector?.firstName} ${collector?.lastName}` });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAssignLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const activeCollectors = collectors.filter(c => c.status === 'active');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Collector Assignment</h1>
          <p className="text-muted-foreground mt-1">Assign and manage collector assignments for pickup requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Unassigned Requests</p>
            <p className="text-3xl font-bold text-yellow-700">{pendingRequests.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Assigned Requests</p>
            <p className="text-3xl font-bold text-blue-700">{assignedRequests.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Awaiting Verification</p>
            <p className="text-3xl font-bold text-orange-700">{collectedRequests.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Available Collectors</p>
            <p className="text-3xl font-bold text-green-700">{activeCollectors.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            Unassigned Requests
          </CardTitle>
          <CardDescription>Requests awaiting collector assignment</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
              All requests have been assigned!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>Assign To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.citizen?.firstName} {request.citizen?.lastName}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{request.pickupAddress}</TableCell>
                    <TableCell><WasteTypeBadge type={request.wasteType} /></TableCell>
                    <TableCell>
                      <Select onValueChange={(value) => handleAssign(request.id, value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select collector" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeCollectors.map(collector => (
                            <SelectItem key={collector.id} value={collector.id}>
                              {collector.firstName} {collector.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Collected - Awaiting Verification */}
      {collectedRequests.length > 0 && (
        <Card className="border-orange-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Awaiting Verification ({collectedRequests.length})
            </CardTitle>
            <CardDescription>Collections that need admin verification before payment</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>Collector</TableHead>
                  <TableHead>Charge</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.citizen?.firstName} {request.citizen?.lastName}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{request.pickupAddress}</TableCell>
                    <TableCell><WasteTypeBadge type={request.wasteType} /></TableCell>
                    <TableCell className="font-medium">
                      {request.collector?.firstName} {request.collector?.lastName}
                    </TableCell>
                    <TableCell>{'\u20B9'}{request.estimatedServiceCharge || 0}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleVerify(request.id)}
                        disabled={assignLoading === request.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {assignLoading === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <><Check className="w-4 h-4 mr-1" /> Verify</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Assigned Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
          <CardDescription>Requests currently assigned to collectors</CardDescription>
        </CardHeader>
        <CardContent>
          {assignedRequests.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No active assignments</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>Assigned Collector</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reassign</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.citizen?.firstName} {request.citizen?.lastName}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{request.pickupAddress}</TableCell>
                    <TableCell><WasteTypeBadge type={request.wasteType} /></TableCell>
                    <TableCell className="font-medium">
                      {request.collector?.firstName} {request.collector?.lastName}
                    </TableCell>
                    <TableCell><StatusBadge status={request.requestStatus} /></TableCell>
                    <TableCell>
                      <Select onValueChange={(value) => handleAssign(request.id, value)}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Reassign" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeCollectors.filter(c => c.id !== request.collectorId).map(collector => (
                            <SelectItem key={collector.id} value={collector.id}>
                              {collector.firstName} {collector.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
