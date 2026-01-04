import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Loader2, ArrowLeft, Briefcase } from 'lucide-react';
import { internshipSchema } from '@/lib/validations';

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Marketing',
  'Design',
  'Engineering',
  'Education',
  'Media',
  'Consulting',
  'Other',
];

const durations = [
  '1 month',
  '2 months',
  '3 months',
  '4 months',
  '6 months',
  '12 months',
  'Flexible',
];

export default function NewInternship() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    duration: '',
    is_paid: false,
    salary_info: '',
    location: '',
    is_remote: false,
    industry: '',
    application_deadline: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth?mode=signin');
      } else if (profile && profile.role !== 'company') {
        navigate('/');
      } else if (profile) {
        fetchCompanyProfile();
      }
    }
  }, [user, profile, authLoading, navigate]);

  const fetchCompanyProfile = async () => {
    const { data } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (!data || !data.company_name) {
      toast.error('Please complete your company profile first');
      navigate('/company/profile');
      return;
    }

    setCompanyProfile(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data for validation
    const dataToValidate = {
      ...formData,
      location: formData.is_remote ? 'Remote' : formData.location,
    };

    // Validate with Zod schema
    const result = internshipSchema.safeParse(dataToValidate);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    // Additional check for non-remote positions
    if (!formData.is_remote && !formData.location.trim()) {
      toast.error('Location is required for on-site positions');
      return;
    }

    setSubmitting(true);

    const validated = result.data;
    const { error } = await supabase
      .from('internships')
      .insert({
        company_id: companyProfile.id,
        title: validated.title,
        description: validated.description,
        requirements: validated.requirements || null,
        duration: validated.duration || null,
        is_paid: validated.is_paid,
        salary_info: validated.salary_info || null,
        location: validated.location,
        is_remote: validated.is_remote,
        industry: validated.industry || null,
        application_deadline: validated.application_deadline || null,
      });

    if (error) {
      toast.error('Failed to create internship');
    } else {
      toast.success('Internship posted successfully!');
      navigate('/company/dashboard');
    }

    setSubmitting(false);
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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          to="/company/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Post New Internship</h1>
            <p className="text-muted-foreground">
              Create a new internship opportunity for students
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Internship Details</CardTitle>
              <CardDescription>Basic information about the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Software Engineering Intern"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the internship role, responsibilities, and what interns will learn..."
                  className="mt-1.5 min-h-32"
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List the skills, qualifications, or experience preferred..."
                  className="mt-1.5 min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where will the intern work?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="is_remote"
                  checked={formData.is_remote}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
                />
                <Label htmlFor="is_remote" className="cursor-pointer">
                  This is a remote position
                </Label>
              </div>

              {!formData.is_remote && (
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                    className="mt-1.5"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle>Compensation</CardTitle>
              <CardDescription>Is this a paid internship?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="is_paid"
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                />
                <Label htmlFor="is_paid" className="cursor-pointer">
                  This is a paid internship
                </Label>
              </div>

              {formData.is_paid && (
                <div>
                  <Label htmlFor="salary_info">Compensation Details</Label>
                  <Input
                    id="salary_info"
                    value={formData.salary_info}
                    onChange={(e) => setFormData({ ...formData, salary_info: e.target.value })}
                    placeholder="e.g., $20/hour or $3,000/month"
                    className="mt-1.5"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deadline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Deadline</CardTitle>
              <CardDescription>When should applications close?</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  className="mt-1.5"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/company/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting} className="flex-1">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Internship'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
