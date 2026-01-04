import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  User,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Twitter,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CompanyApplicants() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth?mode=signin');
      } else if (profile && profile.role !== 'company') {
        navigate('/');
      } else if (profile) {
        fetchApplications();
      }
    }
  }, [user, profile, authLoading, navigate]);

  const fetchApplications = async () => {
    const { data: companyData } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (companyData) {
      const { data: internships } = await supabase
        .from('internships')
        .select('id')
        .eq('company_id', companyData.id);

      if (internships && internships.length > 0) {
        const internshipIds = internships.map(i => i.id);

          const { data } = await supabase
            .from('applications')
            .select(`
              *,
              student_profiles (
                id,
                full_name,
                education_level,
                skills,
                location,
                bio,
                resume_url,
                avatar_url,
                github_url,
                linkedin_url,
                twitter_url,
                portfolio_url,
                projects
              ),
              internships (
                id,
                title
              )
            `)
            .in('internship_id', internshipIds)
            .order('created_at', { ascending: false });

        setApplications(data || []);
      }
    }

    setLoading(false);
  };

  const updateStatus = async (applicationId: string, newStatus: 'applied' | 'reviewed' | 'accepted' | 'rejected') => {
    setUpdating(true);

    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated successfully');
      setApplications(apps =>
        apps.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      setSelectedApplication((prev: any) => prev ? { ...prev, status: newStatus } : null);
    }

    setUpdating(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Applied</Badge>;
      case 'reviewed':
        return <Badge className="bg-info text-info-foreground gap-1"><Eye className="w-3 h-3" />Reviewed</Badge>;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Applicants</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage applications for your internships
          </p>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-7 h-7 text-muted-foreground" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {app.student_profiles?.full_name || 'Anonymous Applicant'}
                          </h3>
                          <p className="text-muted-foreground">
                            Applied for: <Link to={`/internships/${app.internships?.id}`} className="text-primary hover:underline">{app.internships?.title}</Link>
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        {app.student_profiles?.location && (
                          <span>{app.student_profiles.location}</span>
                        )}
                        {app.student_profiles?.education_level && (
                          <span className="capitalize">{app.student_profiles.education_level.replace('_', ' ')}</span>
                        )}
                        <span>
                          Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      {app.student_profiles?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {app.student_profiles.skills.slice(0, 5).map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {app.student_profiles.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{app.student_profiles.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">No applicants yet</h2>
              <p className="text-muted-foreground mb-6">
                Applications will appear here when students apply to your internships.
              </p>
              <Button asChild>
                <Link to="/company/internships/new">Post an Internship</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Application Details Dialog */}
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedApplication && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <span>{selectedApplication.student_profiles?.full_name || 'Applicant'}</span>
                      <p className="text-sm font-normal text-muted-foreground">
                        {selectedApplication.internships?.title}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Status Update */}
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Status</p>
                      <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                    </div>
                    <Select
                      value={selectedApplication.status}
                      onValueChange={(value: 'applied' | 'reviewed' | 'accepted' | 'rejected') => updateStatus(selectedApplication.id, value)}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Student Info */}
                  {selectedApplication.student_profiles?.bio && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">About</h4>
                      <p className="text-muted-foreground">{selectedApplication.student_profiles.bio}</p>
                    </div>
                  )}

                  {selectedApplication.student_profiles?.skills?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.student_profiles.skills.map((skill: string) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApplication.cover_letter && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Cover Letter</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {selectedApplication.cover_letter}
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  {(selectedApplication.student_profiles?.github_url ||
                    selectedApplication.student_profiles?.linkedin_url ||
                    selectedApplication.student_profiles?.twitter_url ||
                    selectedApplication.student_profiles?.portfolio_url) && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Social Links</h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedApplication.student_profiles?.github_url && (
                          <a
                            href={selectedApplication.student_profiles.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <Github className="w-4 h-4" />
                            GitHub
                          </a>
                        )}
                        {selectedApplication.student_profiles?.linkedin_url && (
                          <a
                            href={selectedApplication.student_profiles.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <Linkedin className="w-4 h-4" />
                            LinkedIn
                          </a>
                        )}
                        {selectedApplication.student_profiles?.twitter_url && (
                          <a
                            href={selectedApplication.student_profiles.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <Twitter className="w-4 h-4" />
                            Twitter
                          </a>
                        )}
                        {selectedApplication.student_profiles?.portfolio_url && (
                          <a
                            href={selectedApplication.student_profiles.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <Globe className="w-4 h-4" />
                            Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {selectedApplication.student_profiles?.projects?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Projects</h4>
                      <div className="space-y-3">
                        {selectedApplication.student_profiles.projects.map((project: any, index: number) => (
                          <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{project.title}</span>
                              {project.url && (
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            {project.description && (
                              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                            )}
                            {project.technologies?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.technologies.map((tech: string) => (
                                  <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedApplication.student_profiles?.resume_url && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Resume</h4>
                      <button
                        onClick={async () => {
                          const resumePath = selectedApplication.student_profiles.resume_url;
                          const isFilePath = !resumePath.startsWith('http');
                          
                          if (isFilePath) {
                            const { data, error } = await supabase.storage
                              .from('resumes')
                              .createSignedUrl(resumePath, 3600);
                            
                            if (data?.signedUrl) {
                              window.open(data.signedUrl, '_blank');
                            } else {
                              toast.error('Failed to load resume');
                            }
                          } else {
                            window.open(resumePath, '_blank');
                          }
                        }}
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        View Resume
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Applied {formatDistanceToNow(new Date(selectedApplication.created_at), { addSuffix: true })}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
