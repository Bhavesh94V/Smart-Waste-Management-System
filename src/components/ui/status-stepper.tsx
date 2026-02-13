import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { PickupStatus } from '@/types';

interface StatusStepperProps {
  currentStatus: PickupStatus;
  className?: string;
}

const steps: { status: PickupStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'assigned', label: 'Assigned' },
  { status: 'accepted', label: 'Accepted' },
  { status: 'in_transit', label: 'In Transit' },
  { status: 'collected', label: 'Collected' },
  { status: 'verified', label: 'Verified' },
  { status: 'completed', label: 'Completed' },
];

const statusOrder: PickupStatus[] = ['pending', 'assigned', 'accepted', 'in_transit', 'collected', 'verified', 'completed'];

export function StatusStepper({ currentStatus, className }: StatusStepperProps) {
  // Handle cancelled/rejected separately
  if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
    return (
      <div className={cn("w-full text-center py-4", className)}>
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
          <X className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-red-600 capitalize">{currentStatus}</p>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.status} className="flex flex-col items-center flex-1">
              <div className="relative flex items-center w-full">
                {/* Connector line */}
                {index > 0 && (
                  <div className={cn(
                    "absolute left-0 right-1/2 h-1 -translate-y-1/2 top-1/2",
                    isCompleted || isCurrent ? "bg-primary" : "bg-muted"
                  )} />
                )}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "absolute left-1/2 right-0 h-1 -translate-y-1/2 top-1/2",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} />
                )}
                
                {/* Step circle */}
                <div className={cn(
                  "relative z-10 mx-auto w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : isCurrent 
                      ? "bg-primary/20 border-primary text-primary" 
                      : "bg-muted border-muted-foreground/30 text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <span className="text-xs md:text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
              </div>
              
              {/* Label */}
              <span className={cn(
                "mt-2 text-[10px] md:text-xs font-medium text-center leading-tight",
                isCompleted || isCurrent ? "text-primary" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
