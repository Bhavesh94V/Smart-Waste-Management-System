'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WasteTypeBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { collectorAPI } from '@/services/api';
import { PickupRequest } from '@/types';
import { CheckCircle, Clock, Target, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  type: 'pickup';
  title: string;
  location: string;
  wasteType: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  requestStatus: string;
}

export default function DailyTasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const response: any = await collectorAPI.getAssignedRequests(1, 50);
      const requests: PickupRequest[] = response?.data?.items || [];

      const taskList: Task[] = requests.map((r) => ({
        id: r.id,
        type: 'pickup' as const,
        title: `Pickup from ${r.citizen?.firstName || 'Unknown'} ${r.citizen?.lastName || ''}`.trim(),
        location: r.pickupAddress,
        wasteType: r.wasteType,
        completed: r.requestStatus === 'collected' || r.requestStatus === 'verified' || r.requestStatus === 'completed',
        priority: r.priority === 'urgent' || r.priority === 'high' ? 'high' : r.priority === 'medium' ? 'medium' : 'low',
        requestStatus: r.requestStatus,
      }));

      setTasks(taskList);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdvanceStatus = async (taskId: string, currentStatus: string) => {
    try {
      setActionLoading(taskId);
      // Advance through proper status flow
      if (currentStatus === 'assigned') {
        await collectorAPI.acceptRequest(taskId);
        toast({ title: 'Request accepted' });
      } else if (currentStatus === 'accepted') {
        await collectorAPI.markInTransit(taskId);
        toast({ title: 'Marked as in transit' });
      } else if (currentStatus === 'in_transit') {
        await collectorAPI.markCollected(taskId);
        toast({ title: 'Marked as collected' });
      }
      await loadTasks();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Daily Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} - {tasks.length} tasks scheduled
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadTasks}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-green-500/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{"Today's Progress"}</span>
                <span className="text-sm text-muted-foreground">{completedCount}/{tasks.length} completed</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-1">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">{tasks.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-1">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold">{tasks.length - completedCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>Click on a pending task to mark it as collected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedTasks.map((task) => {
              const canAdvance = !task.completed && !['collected', 'verified', 'completed'].includes(task.requestStatus);
              const nextAction = task.requestStatus === 'assigned' ? 'Accept' 
                : task.requestStatus === 'accepted' ? 'In Transit'
                : task.requestStatus === 'in_transit' ? 'Collected'
                : null;
              const statusLabel = task.requestStatus === 'assigned' ? 'Assigned'
                : task.requestStatus === 'accepted' ? 'Accepted'
                : task.requestStatus === 'in_transit' ? 'In Transit'
                : task.requestStatus;

              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    task.completed 
                      ? 'bg-green-50 border-green-200 opacity-60' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.completed 
                      ? 'bg-green-600 border-green-600' 
                      : task.requestStatus === 'in_transit' ? 'bg-orange-500 border-orange-500'
                      : task.requestStatus === 'accepted' ? 'bg-blue-500 border-blue-500'
                      : 'border-muted-foreground'
                  }`}>
                    {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      {task.priority === 'high' && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-medium">
                          Urgent
                        </span>
                      )}
                      {!task.completed && (
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          task.requestStatus === 'in_transit' ? 'bg-orange-100 text-orange-700' :
                          task.requestStatus === 'accepted' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {statusLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{task.location}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <WasteTypeBadge type={task.wasteType as any} />
                    {canAdvance && nextAction ? (
                      <Button
                        size="sm"
                        variant={task.requestStatus === 'in_transit' ? 'default' : 'outline'}
                        className={task.requestStatus === 'in_transit' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                        disabled={actionLoading === task.id}
                        onClick={() => handleAdvanceStatus(task.id, task.requestStatus)}
                      >
                        {actionLoading === task.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          nextAction
                        )}
                      </Button>
                    ) : task.completed ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                        Done
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-muted-foreground">No tasks scheduled for today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
