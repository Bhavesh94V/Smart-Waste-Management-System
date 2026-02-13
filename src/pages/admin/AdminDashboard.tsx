'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import { Users, Truck, Trash2, TrendingUp, Recycle, AlertTriangle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(45, 93%, 47%)', 'hsl(0, 72%, 51%)'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [statsData, analyticsData] = await Promise.all([
          adminAPI.getSystemStats(),
          adminAPI.getWasteAnalytics(),
        ]);
        
        setStats(statsData);
        setAnalytics(analyticsData);
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Extract values from API response with fallbacks
  const totalUsers = stats?.totalUsers || 0;
  const activeCollectors = stats?.activeCollectors || 0;
  const pendingRequests = stats?.pendingRequests || 0;
  const recycledPercentage = stats?.recycledPercentage || 0;

  const wasteDistribution = [
    { name: 'Dry', value: analytics?.dryWaste || 0 },
    { name: 'Wet', value: analytics?.wetWaste || 0 },
    { name: 'Hazardous', value: analytics?.hazardousWaste || 0 },
  ];

  const weeklyCollectionData = analytics?.weeklyData || [];
  const monthlyTrendData = analytics?.monthlyData || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers} icon={Users} trend={stats?.userTrend} />
        <StatCard title="Active Collectors" value={activeCollectors} icon={Truck} />
        <StatCard title="Pending Requests" value={pendingRequests} icon={AlertTriangle} iconClassName="bg-warning/10" />
        <StatCard title="Recycled" value={`${recycledPercentage}%`} icon={Recycle} iconClassName="bg-success/10" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Weekly Collections</CardTitle><CardDescription>Waste collected by type</CardDescription></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {weeklyCollectionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyCollectionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="dry" fill="hsl(45, 100%, 51%)" name="Dry" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="wet" fill="hsl(142, 76%, 36%)" name="Wet" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="hazardous" fill="hsl(0, 72%, 51%)" name="Hazardous" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No weekly data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monthly Trends</CardTitle><CardDescription>Collections over time</CardDescription></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="collections" stroke="hsl(152, 45%, 28%)" strokeWidth={2} dot={{ fill: 'hsl(152, 45%, 28%)' }} />
                    <Line type="monotone" dataKey="recycled" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ fill: 'hsl(142, 76%, 36%)' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No monthly data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Waste Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={wasteDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {wasteDistribution.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {wasteDistribution.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>System Statistics</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">Total Collections</p>
                <p className="text-3xl font-bold text-primary">{analytics?.totalCollections || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                <p className="text-sm text-muted-foreground">Total Weight (kg)</p>
                <p className="text-3xl font-bold text-success">{analytics?.totalWeight?.toLocaleString() || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-sm text-muted-foreground">Full Bins</p>
                <p className="text-3xl font-bold text-warning">{analytics?.fullBins || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-info/5 border border-info/20">
                <p className="text-sm text-muted-foreground">Active Citizens</p>
                <p className="text-3xl font-bold text-info">{analytics?.activeCitizens || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
