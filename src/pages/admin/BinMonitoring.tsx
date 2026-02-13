'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WasteTypeBadge } from '@/components/ui/status-badge';
import { adminAPI } from '@/services/api';
import { Spinner } from '@/components/ui/spinner';
import { Trash2, AlertTriangle, CheckCircle, Clock, RefreshCw, Plus, Pencil, Trash, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { Bin } from '@/types';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(45, 93%, 47%)', 'hsl(0, 72%, 51%)'];
const wasteTypes = ['biodegradable', 'recyclable', 'hazardous', 'mixed', 'e-waste', 'other'];

interface BinFormData {
  location: string;
  wasteType: string;
  fillLevel: number;
}

export default function BinMonitoring() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<BinFormData>({
    location: '',
    wasteType: 'mixed',
    fillLevel: 0,
  });

  const loadBins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: any = await adminAPI.getAllBins();
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

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      await adminAPI.createBin({
        location: formData.location,
        wasteType: formData.wasteType,
        fillLevel: formData.fillLevel,
      });
      toast({ title: 'Bin Created', description: 'New bin has been added successfully.' });
      setIsCreateOpen(false);
      resetForm();
      await loadBins();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedBin) return;
    try {
      setIsSubmitting(true);
      await adminAPI.updateBin(selectedBin.id, {
        location: formData.location,
        wasteType: formData.wasteType,
        fillLevel: formData.fillLevel,
      });
      toast({ title: 'Bin Updated', description: 'Bin has been updated successfully.' });
      setIsEditOpen(false);
      setSelectedBin(null);
      resetForm();
      await loadBins();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBin) return;
    try {
      setIsSubmitting(true);
      await adminAPI.deleteBin(selectedBin.id);
      toast({ title: 'Bin Deleted', description: 'Bin has been removed.' });
      setIsDeleteOpen(false);
      setSelectedBin(null);
      await loadBins();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkCollected = async (bin: Bin) => {
    try {
      await adminAPI.markBinCollected(bin.id);
      toast({ title: 'Bin Collected', description: `Bin at ${bin.location} marked as collected.` });
      await loadBins();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateFillLevel = async (bin: Bin, fillLevel: number) => {
    try {
      await adminAPI.updateBinFillLevel(bin.id, fillLevel);
      await loadBins();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const openEditDialog = (bin: Bin) => {
    setSelectedBin(bin);
    setFormData({
      location: bin.location,
      wasteType: bin.wasteType,
      fillLevel: bin.fillLevel,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (bin: Bin) => {
    setSelectedBin(bin);
    setIsDeleteOpen(true);
  };

  const resetForm = () => {
    setFormData({ location: '', wasteType: 'mixed', fillLevel: 0 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const fullBins = bins.filter(b => b.status === 'full');
  const halfBins = bins.filter(b => b.status === 'half');
  const emptyBins = bins.filter(b => b.status === 'empty');

  const binFillDistribution = [
    { name: 'Empty (0-39%)', value: emptyBins.length || 0 },
    { name: 'Half (40-79%)', value: halfBins.length || 0 },
    { name: 'Full (80-100%)', value: fullBins.length || 0 },
  ];

  const binsByType = wasteTypes
    .map(type => ({ type, count: bins.filter(b => b.wasteType === type).length }))
    .filter(item => item.count > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bin Monitoring</h1>
          <p className="text-muted-foreground mt-1">Real-time bin status and fill level monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadBins}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" />
            Add Bin
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full Bins</p>
                <p className="text-2xl font-bold text-red-600">{fullBins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Half Full</p>
                <p className="text-2xl font-bold text-yellow-700">{halfBins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empty</p>
                <p className="text-2xl font-bold text-green-700">{emptyBins.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fill Level Distribution</CardTitle>
            <CardDescription>Bins by fill status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={binFillDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {binFillDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {binFillDistribution.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bins by Waste Type</CardTitle>
            <CardDescription>Distribution across waste categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={binsByType}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="type" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bin Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Bins</CardTitle>
              <CardDescription>Manage and monitor all bins</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bins.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">No bins found. Add your first bin.</p>
              <Button size="sm" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
                <Plus className="w-4 h-4 mr-1" />
                Add Bin
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Waste Type</TableHead>
                    <TableHead>Fill Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Collected</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bins.map((bin) => (
                    <TableRow key={bin.id}>
                      <TableCell className="font-medium">{bin.location}</TableCell>
                      <TableCell><WasteTypeBadge type={bin.wasteType} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Progress 
                            value={bin.fillLevel} 
                            className="w-16 h-2"
                          />
                          <span className={`text-sm font-medium ${
                            bin.fillLevel >= 80 ? 'text-red-600' :
                            bin.fillLevel >= 40 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {bin.fillLevel}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bin.status === 'full' ? 'bg-red-100 text-red-700' :
                          bin.status === 'half' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {bin.lastCollected ? format(new Date(bin.lastCollected), 'MMM d, yyyy') : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {bin.fillLevel > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkCollected(bin)}
                              title="Mark as collected"
                            >
                              <RotateCcw className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(bin)}
                            title="Edit bin"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(bin)}
                            title="Delete bin"
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Bin Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bin</DialogTitle>
            <DialogDescription>Add a new waste bin to the monitoring system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-location">Location</Label>
              <Input
                id="create-location"
                placeholder="e.g. Sector 5, Main Road"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-wasteType">Waste Type</Label>
              <Select
                value={formData.wasteType}
                onValueChange={(v) => setFormData(prev => ({ ...prev, wasteType: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wasteTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Initial Fill Level: {formData.fillLevel}%</Label>
              <Slider
                value={[formData.fillLevel]}
                onValueChange={([v]) => setFormData(prev => ({ ...prev, fillLevel: v }))}
                max={100}
                step={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSubmitting || !formData.location}>
              {isSubmitting ? 'Creating...' : 'Create Bin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bin Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bin</DialogTitle>
            <DialogDescription>Update bin details and fill level.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-wasteType">Waste Type</Label>
              <Select
                value={formData.wasteType}
                onValueChange={(v) => setFormData(prev => ({ ...prev, wasteType: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wasteTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fill Level: {formData.fillLevel}%</Label>
              <Slider
                value={[formData.fillLevel]}
                onValueChange={([v]) => setFormData(prev => ({ ...prev, fillLevel: v }))}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Status will auto-update: 0-39% = Empty, 40-79% = Half, 80-100% = Full
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isSubmitting || !formData.location}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bin</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the bin at <strong>{selectedBin?.location}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete Bin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
