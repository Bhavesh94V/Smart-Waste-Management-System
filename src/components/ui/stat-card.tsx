import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  iconClassName?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  className,
  iconClassName 
}: StatCardProps) {
  return (
    <Card className={cn("p-6 card-hover", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <span className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl bg-primary/10",
          iconClassName
        )}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
