import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import {
  Briefcase,
  Users,
  Plus,
  Eye,
  Edit,
  Building2,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function CompanyDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [internships, setInternships] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalInternships: 0,
    activeInternships: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth?mode=signin');
      } else if (profile && profile.role !== 'company') {
        navigate('/');
      } else if (profile) {
        fetchData();
      }
    }
  }, [user, profile, authLoading, navigate]);

  const fetchData = async () => {
    // Fetch company profile
    const { data: companyData } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    setCompanyProfile(companyData);

    if (companyData) {
      // Fetch internships
      const { data: internshipsData } = await supabase
        .from('internships')
        .select('*')
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false });

      setInternships(internshipsData || []);

      // Calculate internship stats
      const activeCount = internshipsData?.filter(i => i.is_active).length || 0;

      // Fetch applications for all internships
      if (internshipsData && internshipsData.length > 0) {
        const internshipIds = internshipsData.map(i => i.id);
        
        const { data: applicationsData } = await supabase
          .from('applications')
          .select(`
            *,
            student_profiles (
              full_name,
              avatar_url
            ),
            internships (
              title
            )
          `)
          .in('internship_id', internshipIds)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentApplications(applicationsData || []);

        // Get total application count
        const { count: totalApps } = await supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .in('internship_id', internshipIds);

        const { count: pendingApps } = await supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .in('internship_id', internshipIds)
          .eq('status', 'applied');

        setStats({
          totalInternships: internshipsData?.length || 0,
          activeInternships: activeCount,
          totalApplications: totalApps || 0,
          pendingApplications: pendingApps || 0,
        });
      }
    }

    setLoading(false);
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back{companyProfile?.company_name ? `, ${companyProfile.company_name}` : ''}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your internship listings and review applications
            </p>
          </div>
          <Button asChild variant="accent">
            <Link to="/company/internships/new">
              <Plus className="w-4 h-4 mr-2" />
              Post New Internship
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalInternships}</p>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.activeInternships}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalApplications}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingApplications}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Internship Listings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Internships</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/company/internships">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {internships.length > 0 ? (
                  <div className="space-y-4">
                    {internships.slice(0, 4).map((internship) => (
                      <div
                        key={internship.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground truncate">
                              {internship.title}
                            </h4>
                            <Badge variant={internship.is_active ? 'default' : 'secondary'}>
                              {internship.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Posted {formatDistanceToNow(new Date(internship.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button asChild variant="ghost" size="icon">
                            <Link to={`/internships/${internship.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon">
                            <Link to={`/company/internships/${internship.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No internships posted yet</p>
                    <Button asChild>
                      <Link to="/company/internships/new">Post Your First Internship</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Applications</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/company/applicants">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.map((app) => (
                      <div key={app.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {app.student_profiles?.full_name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {app.internships?.title}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {app.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No applications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Profile Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/company/profile">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
