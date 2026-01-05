import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  FileText, 
  DollarSign, 
  AlertTriangle,
  Ban,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { Profile, Report } from '@/types/database';
import { toast } from 'sonner';

export default function Admin() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [platformFee, setPlatformFee] = useState('20');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch users
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    setUsers((usersData || []) as Profile[]);
    
    // Fetch reports
    const { data: reportsData } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(*),
        reported_user:profiles!reports_reported_user_id_fkey(*)
      `)
      .order('created_at', { ascending: false });
    
    setReports((reportsData || []) as Report[]);
    
    // Fetch platform settings
    const { data: settings } = await supabase
      .from('platform_settings')
      .select('*')
      .single();
    
    if (settings) {
      setPlatformFee(settings.platform_fee_percentage.toString());
    }
    
    setLoading(false);
  };

  const updatePlatformFee = async () => {
    const { error } = await supabase
      .from('platform_settings')
      .update({ platform_fee_percentage: parseFloat(platformFee) })
      .eq('id', (await supabase.from('platform_settings').select('id').single()).data?.id);
    
    if (error) {
      toast.error('Failed to update platform fee');
    } else {
      toast.success('Platform fee updated');
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    const { error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', reportId);
    
    if (error) {
      toast.error('Failed to update report status');
    } else {
      toast.success('Report status updated');
      fetchData();
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-display font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-display">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Reports
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-display">
                {reports.filter(r => r.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Platform Fee
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-display">{platformFee}%</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          {user.display_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{user.display_name || user.username}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.is_creator_verified && (
                          <Badge variant="secondary">Verified</Badge>
                        )}
                        <Button variant="ghost" size="icon">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No reports yet
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map(report => (
                  <Card key={report.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={
                              report.status === 'pending' ? 'destructive' :
                              report.status === 'resolved' ? 'default' : 'secondary'
                            }
                          >
                            {report.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Reported by @{report.reporter?.username}
                          </span>
                        </div>
                        <p className="font-medium">
                          {report.reported_user && `User: @${report.reported_user.username}`}
                          {report.reported_post_id && `Post ID: ${report.reported_post_id}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.reason}
                        </p>
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => updateReportStatus(report.id, 'dismissed')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => updateReportStatus(report.id, 'resolved')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Platform Fee (%)</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={platformFee}
                      onChange={(e) => setPlatformFee(e.target.value)}
                    />
                    <Button onClick={updatePlatformFee}>Save</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentage taken from all creator earnings
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}