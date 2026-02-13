'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, WasteTypeBadge } from '@/components/ui/status-badge';
import { Spinner } from '@/components/ui/spinner';
import { collectorAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function AssignedRoutes() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: any = await collectorAPI.getAssignedRequests();
      const data = response?.data?.items || [];

      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

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
        <Button onClick={loadRequests}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assigned Pickup Requests</h1>

        <Button variant="outline" size="sm" onClick={loadRequests}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Assigned Requests</CardTitle>
        </CardHeader>

        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              No assigned requests
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-mono text-sm">
                      {req.id}
                    </TableCell>

                    <TableCell>
                      {req.citizen?.firstName} {req.citizen?.lastName}
                    </TableCell>

                    <TableCell>
                      {req.pickupAddress}
                    </TableCell>

                    <TableCell>
                      <WasteTypeBadge type={req.wasteType} />
                    </TableCell>

                    <TableCell>
                      {req.scheduledDate
                        ? format(new Date(req.scheduledDate), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={req.requestStatus} />
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
