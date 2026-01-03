import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export default function StudentApplications() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth?mode=signin');
      } else if (profile && profile.role !== 'student') {
        navigate('/');
      } else if (profile) {
        fetchApplications();
      }
    }
  }, [user, profile, authLoading, navigate]);

  const fetchApplications = async () => {
    const { data: studentData } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (studentData) {
      const { data } = await supabase
        .from('applications')
        .select(`
          *,
          internships (
            id,
            title,
            location,
            is_remote,
            duration,
            is_paid,
            company_profiles (
              company_name,
              logo_url
            )
          )
        `)
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false });

      setApplications(data || []);
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Applied</Badge>;
      case 'reviewed':
        return <Badge className="bg-info text-info-foreground gap-1"><Eye className="w-3 h-3" />Under Review</Badge>;
      case 'accepted':
        return <Badge className="bg-success text-success-foreground gap-1"><CheckCircle2 className="w-3 h-3" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
            <p className="text-muted-foreground mt-1">
              Track the status of your internship applications
            </p>
          </div>
          <Button asChild>
            <Link to="/internships">
              Browse More Internships
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {app.internships.company_profiles.logo_url ? (
                        <img
                          src={app.internships.company_profiles.logo_url}
                          alt={app.internships.company_profiles.company_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <Link
                            to={`/internships/${app.internships.id}`}
                            className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {app.internships.title}
                          </Link>
                          <p className="text-muted-foreground">
                            {app.internships.company_profiles.company_name}
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {app.internships.is_remote ? 'Remote' : app.internships.location}
                        </span>
                        {app.internships.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {app.internships.duration}
                          </span>
                        )}
                        <span>
                          Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      {app.cover_letter && (
                        <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Cover Letter:</p>
                          <p className="text-sm text-foreground line-clamp-2">{app.cover_letter}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">No applications yet</h2>
              <p className="text-muted-foreground mb-6">
                Start exploring internships and submit your first application!
              </p>
              <Button asChild>
                <Link to="/internships">Browse Internships</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
