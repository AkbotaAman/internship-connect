import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    reviewed: 0,
    accepted: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth?mode=signin');
      } else if (profile && profile.role !== 'student') {
        navigate('/');
      } else if (profile) {
        fetchData();
      }
    }
  }, [user, profile, authLoading, navigate]);

  const fetchData = async () => {
    // Fetch student profile
    const { data: studentData } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    setStudentProfile(studentData);

    if (studentData) {
      // Fetch applications
      const { data: applicationsData } = await supabase
        .from('applications')
        .select(`
          *,
          internships (
            id,
            title,
            location,
            is_remote,
            company_profiles (
              company_name,
              logo_url
            )
          )
        `)
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setApplications(applicationsData || []);

      // Calculate stats
      const { data: allApps } = await supabase
        .from('applications')
        .select('status')
        .eq('student_id', studentData.id);

      if (allApps) {
        setStats({
          total: allApps.length,
          applied: allApps.filter(a => a.status === 'applied').length,
          reviewed: allApps.filter(a => a.status === 'reviewed').length,
          accepted: allApps.filter(a => a.status === 'accepted').length,
          rejected: allApps.filter(a => a.status === 'rejected').length,
        });
      }
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Applied</Badge>;
      case 'reviewed':
        return <Badge className="bg-info text-info-foreground"><Eye className="w-3 h-3 mr-1" />Reviewed</Badge>;
      case 'accepted':
        return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const profileCompletion = studentProfile ? 
    Math.round(
      ([
        studentProfile.full_name,
        studentProfile.education_level,
        studentProfile.skills?.length > 0,
        studentProfile.bio,
        studentProfile.location,
      ].filter(Boolean).length / 5) * 100
    ) : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back{studentProfile?.full_name ? `, ${studentProfile.full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your applications and manage your profile
            </p>
          </div>
          <Button asChild>
            <Link to="/internships">
              <Briefcase className="w-4 h-4 mr-2" />
              Browse Internships
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.reviewed}</p>
                  <p className="text-sm text-muted-foreground">Under Review</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.accepted}</p>
                  <p className="text-sm text-muted-foreground">Accepted</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.applied}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Applications</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/student/applications">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <Link
                              to={`/internships/${app.internships.id}`}
                              className="font-medium text-foreground hover:text-primary"
                            >
                              {app.internships.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {app.internships.company_profiles.company_name}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No applications yet</p>
                    <Button asChild variant="outline">
                      <Link to="/internships">Start Applying</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Card */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Profile Completion</span>
                    <span className="text-sm font-medium">{profileCompletion}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>

                {profileCompletion < 100 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete your profile to increase your chances of getting hired!
                  </p>
                )}

                <Button asChild className="w-full">
                  <Link to="/student/profile">
                    {profileCompletion < 100 ? 'Complete Profile' : 'Edit Profile'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
