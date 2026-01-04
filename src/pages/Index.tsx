import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InternshipCard } from '@/components/internships/InternshipCard';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  Briefcase, 
  Building2, 
  GraduationCap,
  ArrowRight,
  Sparkles,
  Users,
  Target,
  Play
} from 'lucide-react';
import demoVideo from '@/assets/internhub-demo.mp4';

export default function Index() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredInternships, setFeaturedInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ internships: 0, companies: 0, students: 0 });

  useEffect(() => {
    fetchFeaturedInternships();
    fetchStats();
  }, []);

  const fetchFeaturedInternships = async () => {
    const { data, error } = await supabase
      .from('internships')
      .select(`
        *,
        company_profiles (
          company_name,
          logo_url,
          industry
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (!error && data) {
      setFeaturedInternships(data);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const [internshipsResult, companiesResult, studentsResult] = await Promise.all([
      supabase.from('internships').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('company_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('student_profiles').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      internships: internshipsResult.count || 0,
      companies: companiesResult.count || 0,
      students: studentsResult.count || 0,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/internships?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 md:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">
                Your career starts here
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Find Your Perfect
              <br />
              <span className="text-primary-foreground/90">Internship Opportunity</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Connect with top companies and kickstart your career with meaningful 
              internship experiences tailored to your goals.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-primary-foreground/10 backdrop-blur-md rounded-2xl border border-primary-foreground/20">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/60" />
                  <Input
                    placeholder="Search internships..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-12 bg-primary-foreground/10 border-0 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/30"
                  />
                </div>
                <Button type="submit" size="xl" variant="accent" className="sm:w-auto w-full">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <Button asChild variant="hero-outline" size="lg">
                <Link to="/internships">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Find Internships
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="lg">
                <Link to="/auth?mode=signup&role=company">
                  <Building2 className="w-5 h-5 mr-2" />
                  Post Internships
                </Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="hero-outline" size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                  <DialogHeader className="p-4 pb-0">
                    <DialogTitle>InternHub Demo</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <video 
                      src={demoVideo} 
                      controls 
                      autoPlay 
                      className="w-full rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <Briefcase className="w-7 h-7 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.internships}+</div>
              <div className="text-muted-foreground">Active Internships</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 mb-4">
                <Building2 className="w-7 h-7 text-accent" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.companies}+</div>
              <div className="text-muted-foreground">Companies</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-success/10 mb-4">
                <Users className="w-7 h-7 text-success" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.students}+</div>
              <div className="text-muted-foreground">Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Featured Internships</h2>
              <p className="text-muted-foreground mt-2">Discover the latest opportunities from top companies</p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link to="/internships">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : featuredInternships.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredInternships.map((internship) => (
                <InternshipCard key={internship.id} internship={internship} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-2xl">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No internships yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to post an internship opportunity!</p>
              <Button asChild variant="accent">
                <Link to="/auth?mode=signup&role=company">
                  Post an Internship
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to="/internships">
                View All Internships
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Sign up and build your professional profile with your skills and experience.',
                icon: GraduationCap,
              },
              {
                step: '02',
                title: 'Discover Opportunities',
                description: 'Browse and search through hundreds of internship listings from top companies.',
                icon: Search,
              },
              {
                step: '03',
                title: 'Apply & Connect',
                description: 'Submit applications with one click and track your progress in real-time.',
                icon: Target,
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className="relative bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="absolute -top-4 left-8 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                  {item.step}
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 mt-2">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-hero rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary-foreground rounded-full blur-3xl" />
            </div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of students and companies already using InternHub 
                to find the perfect match.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="xl" variant="accent">
                  <Link to="/auth?mode=signup">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
