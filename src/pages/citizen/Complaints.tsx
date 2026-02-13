'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { citizenAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ComplaintCategory } from '@/types';
import { 
  MessageSquare, 
  Send, 
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const categories: { value: ComplaintCategory; label: string }[] = [
  { value: 'missed_pickup', label: 'Missed Pickup' },
  { value: 'bin_overflow', label: 'Bin Overflow' },
  { value: 'improper_disposal', label: 'Improper Disposal' },
  { value: 'collector_behavior', label: 'Collector Behavior' },
  { value: 'other', label: 'Other' },
];

interface ComplaintFromAPI {
  id: string;
  category: ComplaintCategory;
  description: string;
  location?: string;
  status: 'submitted' | 'in_review' | 'resolved' | 'dismissed';
  adminNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Complaints() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [complaints, setComplaints] = useState<ComplaintFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '' as ComplaintCategory | '',
    description: '',
    location: '',
  });

  const fetchComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: any = await citizenAPI.getComplaints();
      const data = response?.data || response;
      setComplaints(data?.complaints || []);
    } catch (error: any) {
      console.error('Failed to fetch complaints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaints. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description) {
      toast({
        title: 'Missing Information',
        description: 'Please select a category and provide a description',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await citizenAPI.submitComplaint({
        category: formData.category,
        description: formData.description,
        location: formData.location || undefined,
      });

      toast({
        title: 'Complaint Submitted',
        description: 'Your complaint has been registered. We will get back to you soon.',
      });

      setFormData({ category: '', description: '', location: '' });
      // Refresh list to show the new complaint from backend
      await fetchComplaints();
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit complaint. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_review':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'dismissed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Complaints & Feedback</h1>
        <p className="text-muted-foreground mt-1">
          Report issues or provide feedback about our services
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Complaint form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Submit a Complaint
            </CardTitle>
            <CardDescription>
              Describe your issue and we'll address it promptly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Issue Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as ComplaintCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="Where did this issue occur?"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please describe your issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={5}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Complaint
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous complaints */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Complaints</CardTitle>
                <CardDescription>
                  Track the status of your submitted complaints
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchComplaints}
                disabled={isLoading}
                aria-label="Refresh complaints"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No complaints submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium capitalize">
                        {complaint.category.replace('_', ' ')}
                      </span>
                      <div className={cn(
                        "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                        complaint.status === 'resolved' && "bg-green-100 text-green-800",
                        complaint.status === 'in_review' && "bg-yellow-100 text-yellow-800",
                        complaint.status === 'submitted' && "bg-blue-100 text-blue-800",
                        complaint.status === 'dismissed' && "bg-red-100 text-red-800"
                      )}>
                        {getStatusIcon(complaint.status)}
                        <span className="capitalize">{complaint.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {complaint.description}
                    </p>
                    {complaint.location && (
                      <p className="text-xs text-muted-foreground mb-1">
                        Location: {complaint.location}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Submitted: {format(new Date(complaint.createdAt), 'PPP')}
                    </p>
                    {complaint.resolvedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        Resolved: {format(new Date(complaint.resolvedAt), 'PPP')}
                      </p>
                    )}
                    {complaint.adminNotes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Admin: {complaint.adminNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
