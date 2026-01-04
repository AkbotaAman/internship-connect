import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, Save, Plus, X, Upload, FileText } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type EducationLevel = Database['public']['Enums']['education_level'];

const educationLevels: { value: EducationLevel; label: string }[] = [
  { value: 'high_school', label: 'High School' },
  { value: 'university', label: 'University' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'other', label: 'Other' },
];

const skillSuggestions = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript',
  'Java', 'SQL', 'Git', 'AWS', 'Docker', 'Machine Learning',
  'Data Analysis', 'UI/UX Design', 'Communication', 'Leadership',
];

export default function StudentProfile() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const [formData, setFormData] = useState<{
    full_name: string;
    education_level: EducationLevel;
    skills: string[];
    interests: string[];
    location: string;
    bio: string;
    resume_url: string;
  }>({
    full_name: '',
    education_level: 'university',
    skills: [],
    interests: [],
    location: '',
    bio: '',
    resume_url: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth?mode=signin');
      } else if (profile && profile.role !== 'student') {
        navigate('/');
      } else if (profile) {
        fetchProfile();
      }
    }
  }, [user, profile, authLoading, navigate]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setFormData({
        full_name: data.full_name || '',
        education_level: data.education_level || 'university',
        skills: data.skills || [],
        interests: data.interests || [],
        location: data.location || '',
        bio: data.bio || '',
        resume_url: data.resume_url || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('student_profiles')
      .update(formData)
      .eq('user_id', user?.id);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile saved successfully!');
    }

    setSaving(false);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    const fileName = `${user?.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Failed to upload resume');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    setFormData({ ...formData, resume_url: publicUrl });
    toast.success('Resume uploaded successfully!');
    setUploading(false);
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData({ ...formData, skills: [...formData.skills, trimmed] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData({ ...formData, interests: [...formData.interests, trimmed] });
    }
    setInterestInput('');
  };

  const removeInterest = (interest: string) => {
    setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Edit Profile</h1>
        <p className="text-muted-foreground mb-8">
          Complete your profile to stand out to potential employers
        </p>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="education">Education Level</Label>
                <Select
                  value={formData.education_level as string}
                  onValueChange={(value: EducationLevel) => setFormData({ ...formData, education_level: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell employers about yourself, your goals, and what you're looking for..."
                  className="mt-1.5 min-h-32"
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add your technical and soft skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 p-0.5 hover:bg-muted rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSkill(skillInput)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions
                    .filter(s => !formData.skills.includes(s))
                    .slice(0, 6)
                    .map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="text-xs px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
              <CardDescription>What industries or areas interest you?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.interests.map((interest) => (
                  <Badge key={interest} variant="outline" className="gap-1 pr-1">
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
                      className="ml-1 p-0.5 hover:bg-muted rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  placeholder="Add an interest (e.g., Technology, Healthcare)"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest(interestInput))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addInterest(interestInput)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resume */}
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
              <CardDescription>Upload your resume (PDF, max 5MB)</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.resume_url ? (
                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Resume uploaded</p>
                    <a
                      href={formData.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View resume
                    </a>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, resume_url: '' })}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your resume here, or click to browse
                  </p>
                  <label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <Button variant="outline" asChild disabled={uploading}>
                      <span>
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Choose File'
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
