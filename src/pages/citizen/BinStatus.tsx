'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WasteTypeBadge } from '@/components/ui/status-badge';
import { Spinner } from '@/components/ui/spinner';
import { citizenAPI } from '@/services/api';
import { Bin } from '@/types';
import { Trash2, RefreshCw, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function BinStatus() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const loadBins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: any = await citizenAPI.getNearbyBins();
      setBins(response?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBins();
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
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive/50" />
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadBins}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const getFillColor = (fillLevel: number) => {
    if (fillLevel >= 80) return 'text-red-600';
    if (fillLevel >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getFillBg = (fillLevel: number) => {
    if (fillLevel >= 80) return 'bg-red-500';
    if (fillLevel >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'full': return 'Full';
      case 'half': return 'Partially Full';
      case 'empty': return 'Empty';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'full': return 'bg-red-100 text-red-800 border-red-200';
      case 'half': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'empty': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBins = filter === 'all' ? bins : bins.filter(b => b.status === filter);

  const fullBins = bins.filter(b => b.status === 'full').length;
  const halfBins = bins.filter(b => b.status === 'half').length;
  const emptyBins = bins.filter(b => b.status === 'empty').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community Bin Status</h1>
          <p className="text-muted-foreground mt-1">Monitor nearby waste bins in your area</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadBins}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('all')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trash2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bins</p>
                <p className="text-2xl font-bold">{bins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn("cursor-pointer hover:shadow-md transition-shadow", filter === 'full' && "ring-2 ring-red-500")}
          onClick={() => setFilter(filter === 'full' ? 'all' : 'full')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full</p>
                <p className="text-2xl font-bold text-red-700">{fullBins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn("cursor-pointer hover:shadow-md transition-shadow", filter === 'half' && "ring-2 ring-yellow-500")}
          onClick={() => setFilter(filter === 'half' ? 'all' : 'half')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Trash2 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Partially Full</p>
                <p className="text-2xl font-bold text-yellow-700">{halfBins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn("cursor-pointer hover:shadow-md transition-shadow", filter === 'empty' && "ring-2 ring-green-500")}
          onClick={() => setFilter(filter === 'empty' ? 'all' : 'empty')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Trash2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empty</p>
                <p className="text-2xl font-bold text-green-700">{emptyBins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bins Grid */}
      {filteredBins.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trash2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Bins Found</h3>
            <p className="text-muted-foreground">
              {filter !== 'all' ? `No ${filter} bins in your area` : 'No community bins registered in your area yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBins.map(bin => (
            <Card key={bin.id} className="overflow-hidden">
              <div className={cn("h-1", getFillBg(bin.fillLevel))} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{bin.location}</span>
                  </CardTitle>
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
                    getStatusBadgeClass(bin.status)
                  )}>
                    {getStatusLabel(bin.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fill Level */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Fill Level</span>
                    <span className={cn("font-bold", getFillColor(bin.fillLevel))}>
                      {bin.fillLevel}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", getFillBg(bin.fillLevel))}
                      style={{ width: `${Math.min(bin.fillLevel, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <WasteTypeBadge type={bin.wasteType} />
                  </div>
                  {bin.lastCollected && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        {format(new Date(bin.lastCollected), 'MMM d')}
                      </span>
                    </div>
                  )}
                </div>

                {bin.fillLevel >= 80 && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>This bin needs immediate collection</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
