'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentStatusBadge } from '@/components/ui/status-badge';
import { adminAPI } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import { CreditCard, CheckCircle, Clock, AlertCircle, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Payment } from '@/types';

export default function AdminPayments() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: any = await adminAPI.getPayments(undefined, 1, 100);
      const paymentsData: Payment[] = response?.data?.items || [];
      setPayments(paymentsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRefund = async (paymentId: string) => {
    try {
      await adminAPI.refundPayment(paymentId, 'Admin initiated refund');
      toast({ title: 'Refund initiated successfully' });
      await loadPayments();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const completedPayments = payments.filter(p => p.paymentStatus === 'completed');
  const pendingPayments = payments.filter(p => p.paymentStatus === 'pending' || p.paymentStatus === 'initiated');
  const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground mt-1">Track and verify payment records</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadPayments}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">{'\u20B9'}{totalRevenue.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{'\u20B9'}{pendingAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-700">{payments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {payments.length > 0 
                    ? Math.round((completedPayments.length / payments.length) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <Card className="border-yellow-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="w-5 h-5" />
              Pending Payments
            </CardTitle>
            <CardDescription>Payments awaiting completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border bg-yellow-50">
                  <div>
                    <p className="font-medium font-mono text-sm">{payment.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Pickup: {payment.pickupRequestId}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-lg font-bold">{'\u20B9'}{payment.totalAmount}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <PaymentStatusBadge status={payment.paymentStatus} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>Complete payment history</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No payment records found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">{payment.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{'\u20B9'}{payment.totalAmount}</TableCell>
                    <TableCell>{payment.paymentMethod || '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{payment.transactionId || '-'}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.paymentStatus} />
                    </TableCell>
                    <TableCell>{format(new Date(payment.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {payment.paymentStatus === 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRefund(payment.id)}
                        >
                          Refund
                        </Button>
                      )}
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
