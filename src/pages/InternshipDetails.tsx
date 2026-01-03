import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Globe,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function InternshipDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [internship, setInternship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchInternship();
      if (user && profile?.role === 'student') {
        checkExistingApplication();
        fetchStudentProfile();
      }
    }
  }, [id, user, profile]);

  const fetchInternship = async () => {
    const { data, error } = await supabase
      .from('internships')
      .select(`
        *,
        company_profiles (
          id,
          company_name,
          logo_url,
          description,
          industry,
          location,
          website
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Internship not found');
      navigate('/internships');
      return;
    }

    setInternship(data);
    setLoading(false);
  };

  const checkExistingApplication = async () => {
    const { data: studentData } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (studentData) {
      const { data } = await supabase
        .from('applications')
        .select('id')
        .eq('student_id', studentData.id)
        .eq('internship_id', id)
        .maybeSingle();

      setHasApplied(!!data);
    }
  };

  const fetchStudentProfile = async () => {
    const { data } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    setStudentProfile(data);
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/auth?mode=signin');
      return;
    }

    if (profile?.role !== 'student') {
      toast.error('Only students can apply for internships');
      return;
    }

    if (!studentProfile) {
      toast.error('Please complete your profile first');
      navigate('/student/profile');
      return;
    }

    setApplying(true);

    const { error } = await supabase
      .from('applications')
      .insert({
        student_id: studentProfile.id,
        internship_id: id,
        cover_letter: coverLetter || null,
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already applied for this internship');
      } else {
        toast.error('Failed to submit application');
      }
    } else {
      toast.success('Application submitted successfully!');
      setHasApplied(true);
      setDialogOpen(false);
    }

    setApplying(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!internship) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <Link
            to="/internships"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Internships
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {internship.company_profiles.logo_url ? (
                    <img
                      src={internship.company_profiles.logo_url}
                      alt={internship.company_profiles.company_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {internship.title}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    {internship.company_profiles.company_name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <Badge variant="secondary" className="gap-1 px-3 py-1.5">
                  {internship.is_remote ? (
                    <>
                      <Globe className="w-4 h-4" />
                      Remote
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      {internship.location}
                    </>
                  )}
                </Badge>
                {internship.duration && (
                  <Badge variant="secondary" className="gap-1 px-3 py-1.5">
                    <Clock className="w-4 h-4" />
                    {internship.duration}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={`gap-1 px-3 py-1.5 ${internship.is_paid ? 'bg-success/10 text-success' : ''}`}
                >
                  <DollarSign className="w-4 h-4" />
                  {internship.is_paid ? 'Paid' : 'Unpaid'}
                  {internship.salary_info && ` - ${internship.salary_info}`}
                </Badge>
                {internship.industry && (
                  <Badge variant="outline" className="px-3 py-1.5">
                    {internship.industry}
                  </Badge>
                )}
              </div>
            </div>

            {/* Apply Card */}
            <div className="lg:w-80">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  {hasApplied ? (
                    <div className="text-center py-4">
                      <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                      <h3 className="font-semibold text-foreground mb-1">Application Submitted</h3>
                      <p className="text-sm text-muted-foreground">
                        Track your application in your dashboard
                      </p>
                      <Button asChild variant="outline" className="mt-4 w-full">
                        <Link to="/student/applications">View Applications</Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="lg" className="w-full" variant="accent">
                            <Briefcase className="w-5 h-5 mr-2" />
                            Apply Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Apply for {internship.title}</DialogTitle>
                            <DialogDescription>
                              Submit your application to {internship.company_profiles.company_name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                            <Textarea
                              id="cover-letter"
                              placeholder="Tell them why you're a great fit..."
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                              className="mt-2 min-h-32"
                            />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleApply} disabled={applying}>
                              {applying ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                'Submit Application'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {internship.application_deadline && (
                        <p className="text-sm text-muted-foreground text-center mt-4">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Deadline: {new Date(internship.application_deadline).toLocaleDateString()}
                        </p>
                      )}
                    </>
                  )}

                  <div className="border-t border-border mt-6 pt-6">
                    <p className="text-xs text-muted-foreground">
                      Posted {formatDistanceToNow(new Date(internship.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this Internship</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {internship.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            {internship.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {internship.requirements}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Company Info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                    {internship.company_profiles.logo_url ? (
                      <img
                        src={internship.company_profiles.logo_url}
                        alt={internship.company_profiles.company_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {internship.company_profiles.company_name}
                    </h4>
                    {internship.company_profiles.industry && (
                      <p className="text-sm text-muted-foreground">
                        {internship.company_profiles.industry}
                      </p>
                    )}
                  </div>
                </div>

                {internship.company_profiles.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {internship.company_profiles.description}
                  </p>
                )}

                {internship.company_profiles.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    {internship.company_profiles.location}
                  </p>
                )}

                {internship.company_profiles.website && (
                  <a
                    href={internship.company_profiles.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
