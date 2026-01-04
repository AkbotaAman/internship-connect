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
import { Loader2, Save, Plus, X, Upload, FileText, Github, Linkedin, Globe, ExternalLink, Twitter } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type EducationLevel = Database['public']['Enums']['education_level'];

interface Project {
  title: string;
  description: string;
  url: string;
  technologies: string[];
}

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

  // New project form state
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    description: '',
    url: '',
    technologies: [],
  });
  const [techInput, setTechInput] = useState('');

  const [formData, setFormData] = useState<{
    full_name: string;
    education_level: EducationLevel;
    skills: string[];
    interests: string[];
    location: string;
    bio: string;
    resume_url: string;
    github_url: string;
    linkedin_url: string;
    twitter_url: string;
    portfolio_url: string;
    projects: Project[];
  }>({
    full_name: '',
    education_level: 'university',
    skills: [],
    interests: [],
    location: '',
    bio: '',
    resume_url: '',
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    portfolio_url: '',
    projects: [],
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
        github_url: (data as any).github_url || '',
        linkedin_url: (data as any).linkedin_url || '',
        twitter_url: (data as any).twitter_url || '',
        portfolio_url: (data as any).portfolio_url || '',
        projects: ((data as any).projects as Project[]) || [],
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('student_profiles')
      .update({
        full_name: formData.full_name,
        education_level: formData.education_level,
        skills: formData.skills,
        interests: formData.interests,
        location: formData.location,
        bio: formData.bio,
        resume_url: formData.resume_url,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        twitter_url: formData.twitter_url,
        portfolio_url: formData.portfolio_url,
        projects: formData.projects,
      } as any)
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

    setFormData({ ...formData, resume_url: fileName });
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

  // Project management
  const addTechToProject = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !newProject.technologies.includes(trimmed)) {
      setNewProject({ ...newProject, technologies: [...newProject.technologies, trimmed] });
    }
    setTechInput('');
  };

  const removeTechFromProject = (tech: string) => {
    setNewProject({ ...newProject, technologies: newProject.technologies.filter(t => t !== tech) });
  };

  const addProject = () => {
    if (!newProject.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }
    setFormData({ ...formData, projects: [...formData.projects, newProject] });
    setNewProject({ title: '', description: '', url: '', technologies: [] });
  };

  const removeProject = (index: number) => {
    setFormData({ ...formData, projects: formData.projects.filter((_, i) => i !== index) });
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

          {/* Social Media Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your professional profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Github className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="flex items-center gap-3">
                <Linkedin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="flex items-center gap-3">
                <Twitter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Showcase your work to employers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Projects */}
              {formData.projects.length > 0 && (
                <div className="space-y-3">
                  {formData.projects.map((project, index) => (
                    <div key={index} className="p-4 bg-secondary/30 rounded-lg relative group">
                      <button
                        onClick={() => removeProject(index)}
                        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{project.title}</h4>
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
                          {project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.map((tech) => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Project Form */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-foreground">Add New Project</h4>
                <div>
                  <Input
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="Project Title"
                  />
                </div>
                <div>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Brief description of the project..."
                    className="min-h-20"
                  />
                </div>
                <div>
                  <Input
                    value={newProject.url}
                    onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                    placeholder="Project URL (optional)"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newProject.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="gap-1 pr-1">
                        {tech}
                        <button
                          onClick={() => removeTechFromProject(tech)}
                          className="ml-1 p-0.5 hover:bg-muted rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="Add technology (e.g., React, Python)"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechToProject(techInput))}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTechToProject(techInput)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button type="button" variant="secondary" onClick={addProject} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
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

          {/* Resume (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle>Resume (Optional)</CardTitle>
              <CardDescription>Upload your resume (PDF, max 5MB)</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.resume_url ? (
                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Resume uploaded</p>
                    <button
                      onClick={async () => {
                        const { data, error } = await supabase.storage
                          .from('resumes')
                          .createSignedUrl(formData.resume_url, 3600);
                        
                        if (data?.signedUrl) {
                          window.open(data.signedUrl, '_blank');
                        } else {
                          toast.error('Failed to load resume');
                        }
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      View resume
                    </button>
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
