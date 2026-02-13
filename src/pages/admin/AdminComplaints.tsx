'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { adminAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  Eye,
} from 'lucide-react';

interface ComplaintFromAPI {
  id: string;
  citizenId: string;
  category: string;
  description: string;
  location?: string;
  status: 'submitted' | 'in_review' | 'resolved' | 'dismissed';
  adminNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  citizen?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
}

const statusOptions = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

const categoryLabels: Record<string, string> = {
  missed_pickup: 'Missed Pickup',
  bin_overflow: 'Bin Overflow',
  improper_disposal: 'Improper Disposal',
  collector_behavior: 'Collector Behavior',
  other: 'Other',
};

export default function AdminComplaints() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<ComplaintFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintFromAPI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = filterStatus !== 'all' ? filterStatus : undefined;
      const category = filterCategory !== 'all' ? filterCategory : undefined;
      const response: any = await adminAPI.getComplaints(1, 100, status, category);
      const data = response?.data || response;
      setComplaints(data?.complaints || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to load complaints', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterCategory, toast]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const openUpdateDialog = (complaint: ComplaintFromAPI) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setAdminNotes(complaint.adminNotes || '');
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;
    try {
      setIsUpdating(true);
      await adminAPI.updateComplaintStatus(selectedComplaint.id, newStatus, adminNotes || undefined);
      toast({ title: 'Complaint updated successfully' });
      setIsDialogOpen(false);
      await loadComplaints();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_review': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'dismissed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'dismissed': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const submitted = complaints.filter(c => c.status === 'submitted').length;
  const inReview = complaints.filter(c => c.status === 'in_review').length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const dismissed = complaints.filter(c => c.status === 'dismissed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Complaint Management</h1>
          <p className="text-muted-foreground mt-1">Review and resolve citizen complaints</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadComplaints}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-bold text-blue-700">{submitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Review</p>
                <p className="text-2xl font-bold text-yellow-700">{inReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-700">{resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dismissed</p>
                <p className="text-2xl font-bold text-red-700">{dismissed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Label className="text-xs text-muted-foreground mb-1 block">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            All Complaints
          </CardTitle>
          <CardDescription>{complaints.length} complaints found</CardDescription>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No complaints found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Citizen</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(complaint.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {complaint.citizen?.firstName} {complaint.citizen?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{complaint.citizen?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {categoryLabels[complaint.category] || complaint.category}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm truncate">{complaint.description}</p>
                    </TableCell>
                    <TableCell className="text-sm">{complaint.location || '-'}</TableCell>
                    <TableCell>
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                        getStatusBadgeClass(complaint.status)
                      )}>
                        {getStatusIcon(complaint.status)}
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openUpdateDialog(complaint)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Complaint</DialogTitle>
            <DialogDescription>
              Update the status and add admin notes
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {categoryLabels[selectedComplaint.category] || selectedComplaint.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(selectedComplaint.createdAt), 'PPP')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  By: {selectedComplaint.citizen?.firstName} {selectedComplaint.citizen?.lastName}
                  {selectedComplaint.citizen?.phoneNumber && ` | ${selectedComplaint.citizen.phoneNumber}`}
                </p>
                <p className="text-sm">{selectedComplaint.description}</p>
                {selectedComplaint.location && (
                  <p className="text-xs text-muted-foreground">Location: {selectedComplaint.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  placeholder="Add notes about actions taken..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Complaint'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
