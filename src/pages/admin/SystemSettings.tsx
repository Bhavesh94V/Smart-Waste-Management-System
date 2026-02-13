import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, Shield, Database, Mail, Clock, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { adminAPI } from '@/services/api';

export default function SystemSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState('immediate');
  const [autoAssignment, setAutoAssignment] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [systemName, setSystemName] = useState('Smart Waste Management System');
  const [adminEmail, setAdminEmail] = useState('admin@wms.com');
  const [timezone, setTimezone] = useState('IST');
  const [operatingHoursStart, setOperatingHoursStart] = useState('06:00');
  const [operatingHoursEnd, setOperatingHoursEnd] = useState('20:00');
  const [maxPickupsPerCollector, setMaxPickupsPerCollector] = useState('15');
  const [dryWastePrice, setDryWastePrice] = useState('50');
  const [wetWastePrice, setWetWastePrice] = useState('30');
  const [hazardousWastePrice, setHazardousWastePrice] = useState('100');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [smsGatewayApiKey, setSmsGatewayApiKey] = useState('');
  const [paymentGatewayApiKey, setPaymentGatewayApiKey] = useState('');
  const [mapsApiKey, setMapsApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response: any = await adminAPI.getSettings();
        const data = response?.data || response;
        if (data) {
          if (data.systemName) setSystemName(data.systemName);
          if (data.adminEmail) setAdminEmail(data.adminEmail);
          if (data.timezone) setTimezone(data.timezone);
          if (data.emailNotifications !== undefined) setEmailNotifications(data.emailNotifications);
          if (data.smsNotifications !== undefined) setSmsNotifications(data.smsNotifications);
          if (data.notificationFrequency) setNotificationFrequency(data.notificationFrequency);
          if (data.autoAssignment !== undefined) setAutoAssignment(data.autoAssignment);
          if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
          if (data.operatingHoursStart) setOperatingHoursStart(data.operatingHoursStart);
          if (data.operatingHoursEnd) setOperatingHoursEnd(data.operatingHoursEnd);
          if (data.maxPickupsPerCollector !== undefined) setMaxPickupsPerCollector(String(data.maxPickupsPerCollector));
          if (data.dryWastePrice !== undefined) setDryWastePrice(String(data.dryWastePrice));
          if (data.wetWastePrice !== undefined) setWetWastePrice(String(data.wetWastePrice));
          if (data.hazardousWastePrice !== undefined) setHazardousWastePrice(String(data.hazardousWastePrice));
          if (data.sessionTimeout !== undefined) setSessionTimeout(String(data.sessionTimeout));
          if (data.maxLoginAttempts !== undefined) setMaxLoginAttempts(String(data.maxLoginAttempts));
          if (data.smsGatewayApiKey) setSmsGatewayApiKey(data.smsGatewayApiKey);
          if (data.paymentGatewayApiKey) setPaymentGatewayApiKey(data.paymentGatewayApiKey);
          if (data.mapsApiKey) setMapsApiKey(data.mapsApiKey);
        }
      } catch {
        // Use defaults if settings not loaded
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminAPI.saveSettings({
        systemName,
        adminEmail,
        timezone,
        emailNotifications,
        smsNotifications,
        notificationFrequency,
        autoAssignment,
        maintenanceMode,
        operatingHoursStart,
        operatingHoursEnd,
        maxPickupsPerCollector: parseInt(maxPickupsPerCollector) || 15,
        dryWastePrice: parseInt(dryWastePrice) || 50,
        wetWastePrice: parseInt(wetWastePrice) || 30,
        hazardousWastePrice: parseInt(hazardousWastePrice) || 100,
        sessionTimeout: parseInt(sessionTimeout) || 30,
        maxLoginAttempts: parseInt(maxLoginAttempts) || 5,
        smsGatewayApiKey,
        paymentGatewayApiKey,
        mapsApiKey,
      });
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };
 
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

   return (
     <div className="space-y-6 animate-fade-in">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-bold">System Settings</h1>
           <p className="text-muted-foreground mt-1">Configure system-wide settings and preferences</p>
         </div>
         <Button onClick={handleSave} disabled={isSaving}>
           <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
         </Button>
       </div>
 
       <div className="grid gap-6 lg:grid-cols-2">
         {/* General Settings */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Settings className="w-5 h-5" /> General Settings
             </CardTitle>
             <CardDescription>Basic system configuration</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label>System Name</Label>
               <Input value={systemName} onChange={(e) => setSystemName(e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Admin Email</Label>
               <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Default Timezone</Label>
               <Select value={timezone} onValueChange={setTimezone}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="IST">India Standard Time (IST)</SelectItem>
                   <SelectItem value="UTC">Coordinated Universal Time (UTC)</SelectItem>
                   <SelectItem value="EST">Eastern Standard Time (EST)</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </CardContent>
         </Card>
 
         {/* Notification Settings */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Bell className="w-5 h-5" /> Notification Settings
             </CardTitle>
             <CardDescription>Configure notification preferences</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
               <div>
                 <Label>Email Notifications</Label>
                 <p className="text-sm text-muted-foreground">Send email alerts for important events</p>
               </div>
               <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
             </div>
             <Separator />
             <div className="flex items-center justify-between">
               <div>
                 <Label>SMS Notifications</Label>
                 <p className="text-sm text-muted-foreground">Send SMS alerts to collectors</p>
               </div>
               <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
             </div>
             <Separator />
             <div className="space-y-2">
               <Label>Notification Frequency</Label>
               <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="immediate">Immediate</SelectItem>
                   <SelectItem value="hourly">Hourly Digest</SelectItem>
                   <SelectItem value="daily">Daily Digest</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </CardContent>
         </Card>
 
         {/* Collection Settings */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Clock className="w-5 h-5" /> Collection Settings
             </CardTitle>
             <CardDescription>Configure collection operations</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
               <div>
                 <Label>Auto Assignment</Label>
                 <p className="text-sm text-muted-foreground">Automatically assign collectors to requests</p>
               </div>
               <Switch checked={autoAssignment} onCheckedChange={setAutoAssignment} />
             </div>
             <Separator />
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Operating Hours Start</Label>
                 <Input type="time" value={operatingHoursStart} onChange={(e) => setOperatingHoursStart(e.target.value)} />
               </div>
               <div className="space-y-2">
                 <Label>Operating Hours End</Label>
                 <Input type="time" value={operatingHoursEnd} onChange={(e) => setOperatingHoursEnd(e.target.value)} />
               </div>
             </div>
             <div className="space-y-2">
               <Label>Max Pickups per Collector (daily)</Label>
               <Input type="number" value={maxPickupsPerCollector} onChange={(e) => setMaxPickupsPerCollector(e.target.value)} />
             </div>
           </CardContent>
         </Card>
 
         {/* Pricing Settings */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Database className="w-5 h-5" /> Pricing Configuration
             </CardTitle>
             <CardDescription>Set service charges by waste type</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label>Dry Waste (₹ per pickup)</Label>
               <Input type="number" value={dryWastePrice} onChange={(e) => setDryWastePrice(e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Wet Waste (₹ per pickup)</Label>
               <Input type="number" value={wetWastePrice} onChange={(e) => setWetWastePrice(e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Hazardous Waste (₹ per pickup)</Label>
               <Input type="number" value={hazardousWastePrice} onChange={(e) => setHazardousWastePrice(e.target.value)} />
             </div>
           </CardContent>
         </Card>
 
         {/* Security Settings */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Shield className="w-5 h-5" /> Security Settings
             </CardTitle>
             <CardDescription>System security configuration</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label>Session Timeout (minutes)</Label>
               <Input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Max Login Attempts</Label>
               <Input type="number" value={maxLoginAttempts} onChange={(e) => setMaxLoginAttempts(e.target.value)} />
             </div>
             <Separator />
             <div className="flex items-center justify-between">
               <div>
                 <Label className="text-destructive">Maintenance Mode</Label>
                 <p className="text-sm text-muted-foreground">Temporarily disable system access</p>
               </div>
               <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
             </div>
           </CardContent>
         </Card>
 
         {/* API Settings */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Mail className="w-5 h-5" /> API & Integration
             </CardTitle>
             <CardDescription>External service configuration</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label>SMS Gateway API Key</Label>
               <Input type="password" value={smsGatewayApiKey} onChange={(e) => setSmsGatewayApiKey(e.target.value)} placeholder="Enter SMS gateway API key" />
             </div>
             <div className="space-y-2">
               <Label>Payment Gateway API Key</Label>
               <Input type="password" value={paymentGatewayApiKey} onChange={(e) => setPaymentGatewayApiKey(e.target.value)} placeholder="Enter payment gateway API key" />
             </div>
             <div className="space-y-2">
               <Label>Maps API Key</Label>
               <Input type="password" value={mapsApiKey} onChange={(e) => setMapsApiKey(e.target.value)} placeholder="Enter maps API key" />
             </div>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }
