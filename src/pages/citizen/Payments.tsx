'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { PaymentStatusBadge, WasteTypeBadge } from '@/components/ui/status-badge';
import { citizenAPI } from '@/services/api';
import { Payment, PaymentMethod } from '@/types';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle, 
  Loader2,
  Receipt,
  ArrowRight,
  Wallet,
  Banknote,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const paymentMethods: { id: PaymentMethod; label: string; icon: any; description: string }[] = [
  { id: 'upi', label: 'UPI', icon: Smartphone, description: 'Pay with any UPI app' },
  { id: 'credit_card', label: 'Credit Card', icon: CreditCard, description: 'Visa, Mastercard' },
  { id: 'debit_card', label: 'Debit Card', icon: CreditCard, description: 'All bank debit cards' },
  { id: 'bank_transfer', label: 'Net Banking', icon: Building2, description: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, description: 'PayU, Paytm, etc.' },
  { id: 'cash_on_collection', label: 'Cash on Collection', icon: Banknote, description: 'Pay when collected' },
];

export default function Payments() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const pickupRequestId = searchParams.get('pickupRequestId');
  const { toast } = useToast();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<Payment | null>(null);
  const [completedPayments, setCompletedPayments] = useState<Payment[]>([]);
  const [lastPaidPayment, setLastPaidPayment] = useState<Payment | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: any = await citizenAPI.getPayments(1, 50);
      const paymentsData: Payment[] = response?.data?.items || [];
      setPayments(paymentsData);
      
      // Find pending/initiated payments
      const pendingPayments = paymentsData.filter(
        p => p.paymentStatus === 'pending' || p.paymentStatus === 'initiated'
      );
      
      // If we have a pickupRequestId from URL, prioritize that payment
      if (pickupRequestId) {
        const matchingPayment = pendingPayments.find(
          p => p.pickupRequestId === pickupRequestId
        );
        if (matchingPayment) {
          setPendingPayment(matchingPayment);
        } else {
          // No payment found for this pickup request - try to generate one
          setPendingPayment(null);
        }
      } else {
        setPendingPayment(pendingPayments.length > 0 ? pendingPayments[0] : null);
      }
      
      setCompletedPayments(
        paymentsData.filter(
          p => p.paymentStatus === 'completed' || p.paymentStatus === 'failed' || p.paymentStatus === 'refunded'
        )
      );

      return pendingPayments;
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [pickupRequestId]);

  // Auto-generate invoice if pickupRequestId is in URL and no matching payment found
  const generateInvoiceIfNeeded = useCallback(async () => {
    if (!pickupRequestId) return;
    
    try {
      setIsGenerating(true);
      const invoiceResponse: any = await citizenAPI.generateInvoice(pickupRequestId);
      const generatedPayment = invoiceResponse?.data;
      
      if (generatedPayment) {
        setPendingPayment(generatedPayment);
        toast({
          title: 'Invoice Generated',
          description: 'Your payment invoice has been created.',
        });
        // Reload to get full list
        await loadPayments();
        // Re-set the pending payment from the reloaded list
        return true;
      }
    } catch (err: any) {
      console.error('Invoice generation error:', err.message);
      // If it says already initiated, reload payments to find it
      if (err.message?.includes('already initiated') || err.message?.includes('already')) {
        await loadPayments();
      } else {
        toast({
          title: 'Invoice Generation Failed',
          description: err.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsGenerating(false);
    }
    return false;
  }, [pickupRequestId, toast, loadPayments]);

  useEffect(() => {
    const init = async () => {
      const pendingList = await loadPayments();
      
      // If we have a pickupRequestId but no matching payment was found, auto-generate
      if (pickupRequestId) {
        const hasMatch = pendingList.some(
          (p: any) => p.pickupRequestId === pickupRequestId
        );
        if (!hasMatch) {
          await generateInvoiceIfNeeded();
          // Reload payments after generation
          await loadPayments();
        }
      }
    };

    init();
  }, [pickupRequestId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePayment = async () => {
    if (!pendingPayment) return;

    try {
      setIsProcessing(true);
      
      // Step 1: If pending, initiate payment with method
      if (pendingPayment.paymentStatus === 'pending') {
        await citizenAPI.initiatePayment(pendingPayment.id, selectedMethod);
      }
      
      // Step 2: Complete payment
      const completeResponse: any = await citizenAPI.completePayment(pendingPayment.id);
      
      setLastPaidPayment(completeResponse?.data || pendingPayment);
      setPaymentComplete(true);
      toast({
        title: 'Payment Successful!',
        description: 'Your payment has been processed successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Payment Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Spinner />
        <p className="text-sm text-muted-foreground">
          {isGenerating ? 'Generating invoice...' : 'Loading payments...'}
        </p>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your payment. Your pickup request is now complete.
            </p>
            
            <div className="p-4 bg-muted rounded-lg text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invoice</span>
                <span className="font-mono">{lastPaidPayment?.invoiceNumber || pendingPayment?.invoiceNumber || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold">{'\u20B9'}{lastPaidPayment?.totalAmount || pendingPayment?.totalAmount || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="text-green-600 font-medium">Completed</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{format(new Date(), 'PPP')}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link to="/citizen/track">
                  View Track Status
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/citizen">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {pickupRequestId && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/citizen/track">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Link>
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Payments</h1>
            <p className="text-muted-foreground mt-1">Pay for your waste pickup services</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadPayments()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payment form */}
        <div className="lg:col-span-2 space-y-6">
          {pendingPayment ? (
            <>
              {/* Invoice */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    Invoice Details
                  </CardTitle>
                  <CardDescription>Invoice #{pendingPayment.invoiceNumber}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingPayment.pickupRequest && (
                      <>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Waste Type</span>
                          <WasteTypeBadge type={pendingPayment.pickupRequest.wasteType} />
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Quantity</span>
                          <span className="font-medium">{pendingPayment.pickupRequest.wasteQuantity} kg</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Service Charge</span>
                      <span className="font-medium">{'\u20B9'}{pendingPayment.serviceCharge}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Tax (GST 18%)</span>
                      <span className="font-medium">{'\u20B9'}{pendingPayment.tax}</span>
                    </div>
                    <div className="flex justify-between py-3 text-lg">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-bold text-primary">{'\u20B9'}{pendingPayment.totalAmount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment method */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedMethod} onValueChange={(v) => setSelectedMethod(v as PaymentMethod)}>
                    <div className="grid gap-3">
                      {paymentMethods.map((method) => (
                        <Label
                          key={method.id}
                          htmlFor={method.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                            selectedMethod === method.id 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <div className="p-2 rounded-lg bg-muted">
                            <method.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{method.label}</p>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>

                  {selectedMethod === 'upi' && (
                    <div className="mt-4 space-y-3">
                      <Label htmlFor="upi">UPI ID</Label>
                      <Input id="upi" placeholder="yourname@upi" />
                    </div>
                  )}

                  {(selectedMethod === 'credit_card' || selectedMethod === 'debit_card') && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="expiry">Expiry</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" type="password" />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full mt-6" 
                    size="lg"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay {'\u20B9'}{pendingPayment.totalAmount}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500/50" />
                <h3 className="text-lg font-semibold mb-2">No Pending Payments</h3>
                <p className="text-muted-foreground mb-4">
                  {"You're all caught up! No payments are due at the moment."}
                </p>
                <Button asChild variant="outline">
                  <Link to="/citizen/track">View Track Status</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment history */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {completedPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No payment history
              </p>
            ) : (
              <div className="space-y-3">
                {completedPayments.map((payment) => (
                  <div key={payment.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs">{payment.invoiceNumber}</span>
                      <PaymentStatusBadge status={payment.paymentStatus} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(payment.invoiceDate || payment.createdAt), 'PP')}
                      </span>
                      <span className="font-semibold">{'\u20B9'}{payment.totalAmount}</span>
                    </div>
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
