'use client';

import React from "react"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { citizenAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { WasteType, TimeSlot } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Truck, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock,
  Package,
  Leaf,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Recycle,
  Cpu,
  Shuffle
} from 'lucide-react';
import { format } from 'date-fns';

const wasteTypes: { type: WasteType; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    type: 'biodegradable', 
    label: 'Biodegradable', 
    icon: <Leaf className="w-6 h-6" />,
    description: 'Food scraps, garden waste, organic material',
  },
  { 
    type: 'recyclable', 
    label: 'Recyclable', 
    icon: <Recycle className="w-6 h-6" />,
    description: 'Paper, plastic, metal, glass',
  },
  { 
    type: 'hazardous', 
    label: 'Hazardous', 
    icon: <AlertTriangle className="w-6 h-6" />,
    description: 'Chemicals, batteries, medical waste',
  },
  { 
    type: 'mixed', 
    label: 'Mixed Waste', 
    icon: <Shuffle className="w-6 h-6" />,
    description: 'Combination of different waste types',
  },
  { 
    type: 'e-waste', 
    label: 'E-Waste', 
    icon: <Cpu className="w-6 h-6" />,
    description: 'Electronics, gadgets, wires, PCBs',
  },
  { 
    type: 'other', 
    label: 'Other', 
    icon: <Package className="w-6 h-6" />,
    description: 'Other types of waste',
  },
];

const timeSlots: { value: TimeSlot; label: string }[] = [
  { value: '8AM-11AM', label: '8:00 AM - 11:00 AM' },
  { value: '11AM-2PM', label: '11:00 AM - 2:00 PM' },
  { value: '2PM-5PM', label: '2:00 PM - 5:00 PM' },
  { value: '5PM-8PM', label: '5:00 PM - 8:00 PM' },
];

export default function RequestPickup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    wasteType: '' as WasteType | '',
    pickupAddress: user?.address || '',
    description: '',
    wasteQuantity: '',
    scheduledDate: undefined as Date | undefined,
    preferredTimeSlot: '' as TimeSlot | '',
    priority: 'medium' as string,
  });

  const handleWasteTypeSelect = (type: WasteType) => {
    setFormData(prev => ({ ...prev, wasteType: type }));
  };

  const handleSubmit = async () => {
    if (!formData.wasteType || !formData.pickupAddress || !formData.wasteQuantity || !formData.scheduledDate || !formData.preferredTimeSlot) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields: waste type, address, quantity, date and time slot',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response: any = await citizenAPI.createPickupRequest({
        wasteType: formData.wasteType,
        wasteQuantity: parseFloat(formData.wasteQuantity),
        pickupAddress: formData.pickupAddress,
        scheduledDate: formData.scheduledDate.toISOString(),
        preferredTimeSlot: formData.preferredTimeSlot,
        description: formData.description || undefined,
        priority: formData.priority,
      });
      
      toast({
        title: 'Request Submitted!',
        description: 'Your pickup request has been created successfully.',
      });
      
      const newId = response?.data?.id || response?.id;
      if (newId) {
        navigate(`/citizen/track/${newId}`);
      } else {
        navigate('/citizen/track');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.wasteType;
      case 2: return !!formData.pickupAddress && !!formData.wasteQuantity;
      case 3: return !!formData.scheduledDate && !!formData.preferredTimeSlot;
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
              s < step ? "bg-primary text-primary-foreground" :
              s === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
              "bg-muted text-muted-foreground"
            )}>
              {s < step ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div className={cn(
                "flex-1 h-1 mx-2",
                s < step ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Waste Type Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Select Waste Type
            </CardTitle>
            <CardDescription>Choose the type of waste you want to dispose</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.wasteType}
              onValueChange={(value) => handleWasteTypeSelect(value as WasteType)}
              className="grid gap-3"
            >
              {wasteTypes.map((waste) => (
                <Label
                  key={waste.type}
                  htmlFor={waste.type}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    formData.wasteType === waste.type 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <RadioGroupItem value={waste.type} id={waste.type} className="sr-only" />
                  <div className="p-3 rounded-lg bg-muted">
                    {waste.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{waste.label}</p>
                    <p className="text-sm text-muted-foreground">{waste.description}</p>
                  </div>
                  {formData.wasteType === waste.type && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Location & Quantity */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Pickup Details
            </CardTitle>
            <CardDescription>Enter your pickup address and waste quantity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Pickup Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="pickupAddress"
                  placeholder="Enter your full pickup address..."
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                  className="pl-10 min-h-[100px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wasteQuantity">Waste Quantity (kg) *</Label>
              <Input
                id="wasteQuantity"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g., 5.0"
                value={formData.wasteQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, wasteQuantity: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Any special instructions or details about the waste..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Schedule Pickup
            </CardTitle>
            <CardDescription>Choose your preferred date and time slot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Pickup Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledDate ? format(formData.scheduledDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, scheduledDate: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Preferred Time Slot *</Label>
                <Select 
                  value={formData.preferredTimeSlot} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, preferredTimeSlot: value as TimeSlot }))}
                >
                  <SelectTrigger>
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold mb-3">Request Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waste Type:</span>
                  <span className="font-medium capitalize">{formData.wasteType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{formData.wasteQuantity} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium truncate max-w-[200px]">{formData.pickupAddress}</span>
                </div>
                {formData.scheduledDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled:</span>
                    <span className="font-medium">
                      {format(formData.scheduledDate, 'PP')} {formData.preferredTimeSlot || ''}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="font-medium capitalize">{formData.priority}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1}
        >
          Previous
        </Button>
        
        {step < 3 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !canProceed()}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
