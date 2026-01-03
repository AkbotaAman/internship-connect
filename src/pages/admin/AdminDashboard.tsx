import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  Briefcase,
  Building2,
  GraduationCap,
  Trash2,
  Loader2,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCompanies: 0,
    totalInternships: 0,
    totalApplications: 0,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth?mode=signin');
      } else if (profile && profile.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        navigate('/');
      } else if (profile) {
        fetchData();
      }
    }
  }, [user, profile, authLoading, navigate]);

  const fetchData = async () => {
    // Fetch all profiles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    setUsers(profilesData || []);

    // Fetch all internships
    const { data: internshipsData } = await supabase
      .from('internships')
      .select(`
        *,
        company_profiles (
          company_name
        )
      `)
      .order('created_at', { ascending: false });

    setInternships(internshipsData || []);

    // Calculate stats
    const studentCount = profilesData?.filter(p => p.role === 'student').length || 0;
    const companyCount = profilesData?.filter(p => p.role === 'company').length || 0;

    const { count: appCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true });

    setStats({
      totalUsers: profilesData?.length || 0,
      totalStudents: studentCount,
      totalCompanies: companyCount,
      totalInternships: internshipsData?.length || 0,
      totalApplications: appCount || 0,
    });

    setLoading(false);
  };

  const deleteInternship = async (id: string) => {
    const { error } = await supabase
      .from('internships')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete internship');
    } else {
      toast.success('Internship deleted');
      setInternships(internships.filter(i => i.id !== id));
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users and moderate content</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-info" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalCompanies}</p>
                  <p className="text-xs text-muted-foreground">Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalInternships}</p>
                  <p className="text-xs text-muted-foreground">Internships</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                  <p className="text-xs text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          {u.role === 'company' ? (
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                          ) : u.role === 'admin' ? (
                            <Shield className="w-5 h-5 text-primary" />
                          ) : (
                            <GraduationCap className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{u.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                        {u.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internships">
            <Card>
              <CardHeader>
                <CardTitle>All Internships</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {internships.map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{i.title}</p>
                          <Badge variant={i.is_active ? 'default' : 'secondary'}>
                            {i.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {i.company_profiles?.company_name} • Posted {formatDistanceToNow(new Date(i.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Internship</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{i.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteInternship(i.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
