import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InternshipCard } from '@/components/internships/InternshipCard';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Briefcase, 
  Building2, 
  GraduationCap,
  ArrowRight,
  Sparkles,
  Users,
  Target,
  Star,
  Quote
} from 'lucide-react';

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Software Engineering Intern",
    company: "Tech Innovations Inc.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    quote: "InternHub made finding my dream internship incredibly easy. The platform's intuitive design helped me discover opportunities I wouldn't have found elsewhere.",
    rating: 5,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "Product Design Intern",
    company: "Creative Studios",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    quote: "The application process was seamless. I applied to multiple companies and received responses within days. Highly recommend to any student!",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Marketing Intern",
    company: "Growth Partners",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    quote: "As a first-generation college student, InternHub's accessible design and clear instructions made the intimidating job search feel manageable.",
    rating: 5,
  },
];

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

    // Use minimum values for demo purposes
    setStats({
      internships: Math.max(internshipsResult.count || 0, 500),
      companies: Math.max(companiesResult.count || 0, 150),
      students: Math.max(studentsResult.count || 0, 2000),
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/internships?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <Layout>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Hero Section - Glassmorphism with mesh gradient */}
      <section className="relative overflow-hidden bg-gradient-hero py-28 md:py-36" role="banner">
        {/* Mesh background pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-mesh" />
          <div className="absolute top-20 left-10 w-80 h-80 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-foreground/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative" id="main-content">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-dark rounded-full px-5 py-2.5 mb-8 animate-fade-up">
              <Sparkles className="w-4 h-4 text-accent" aria-hidden="true" />
              <span className="text-sm font-medium text-primary-foreground">
                Your career starts here
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-up leading-tight" style={{ animationDelay: '0.1s' }}>
              Find Your Perfect
              <br />
              <span className="text-primary-foreground/90">Internship Match</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto animate-fade-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
              Connect with innovative companies and launch your career with 
              meaningful experiences designed around your goals.
            </p>

            {/* Search Bar - Glassmorphism */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.3s' }} role="search" aria-label="Search internships">
              <div className="flex flex-col sm:flex-row gap-3 p-3 glass-dark rounded-2xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/50" aria-hidden="true" />
                  <Input
                    placeholder="Search internships, companies, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-12 bg-primary-foreground/10 border-0 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-primary-foreground/30 rounded-xl"
                    aria-label="Search internships"
                  />
                </div>
                <Button type="submit" size="xl" variant="accent" className="sm:w-auto w-full">
                  <Search className="w-5 h-5 mr-2" aria-hidden="true" />
                  Search
                </Button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <Button asChild variant="hero-outline" size="lg">
                <Link to="/internships">
                  <GraduationCap className="w-5 h-5 mr-2" aria-hidden="true" />
                  Browse Opportunities
                </Link>
              </Button>
              <Button asChild variant="hero-outline" size="lg">
                <Link to="/auth?mode=signup&role=company">
                  <Building2 className="w-5 h-5 mr-2" aria-hidden="true" />
                  Post Internships
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Glass cards */}
      <section className="py-16 bg-background relative" aria-label="Platform statistics">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-20">
            {[
              { icon: Briefcase, value: stats.internships, label: "Active Internships", color: "primary" },
              { icon: Building2, value: stats.companies, label: "Companies", color: "accent" },
              { icon: Users, value: stats.students, label: "Students", color: "success" },
            ].map((stat, index) => (
              <div 
                key={index}
                className="glass-card rounded-2xl p-8 text-center hover-lift animate-fade-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${stat.color}/10 mb-5`}>
                  <stat.icon className={`w-8 h-8 text-${stat.color}`} aria-hidden="true" />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">{stat.value}+</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Internships - Minimalist */}
      <section className="py-24 bg-background" aria-label="Featured internships">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Featured Opportunities</h2>
              <p className="text-muted-foreground text-lg">Handpicked internships from leading companies</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex group">
              <Link to="/internships">
                View All
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-52 glass-card rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : featuredInternships.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredInternships.map((internship, index) => (
                <div key={internship.id} className="animate-fade-up" style={{ animationDelay: `${0.05 * index}s` }}>
                  <InternshipCard internship={internship} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card rounded-3xl">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-6" aria-hidden="true" />
              <h3 className="text-2xl font-semibold text-foreground mb-3">No internships yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Be the first to post an internship opportunity and connect with talented students!</p>
              <Button asChild variant="accent" size="lg">
                <Link to="/auth?mode=signup&role=company">
                  Post an Internship
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-10 text-center md:hidden">
            <Button asChild variant="outline" size="lg">
              <Link to="/internships">
                View All Internships
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works - Clean minimalist steps */}
      <section className="py-24 bg-secondary/30 relative" aria-label="How it works">
        <div className="absolute inset-0 bg-mesh opacity-20" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to launch your career journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Build a professional profile showcasing your skills, experience, and career aspirations.',
                icon: GraduationCap,
              },
              {
                step: '02',
                title: 'Discover Opportunities',
                description: 'Browse curated internships from innovative companies using our smart search filters.',
                icon: Search,
              },
              {
                step: '03',
                title: 'Apply & Connect',
                description: 'Submit applications with one click and track your progress in real-time.',
                icon: Target,
              },
            ].map((item, index) => (
              <article 
                key={index} 
                className="relative glass-card rounded-3xl p-10 hover-lift animate-fade-up group"
                style={{ animationDelay: `${0.15 * index}s` }}
              >
                <div className="absolute -top-4 left-10 bg-gradient-primary text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                  {item.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 mt-2 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background" aria-label="Student testimonials">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Loved by Students</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hear from students who found their dream internships through InternHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <article 
                key={testimonial.id}
                className="glass-card rounded-3xl p-8 hover-lift animate-fade-up relative"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" aria-hidden="true" />
                
                {/* Stars */}
                <div className="flex gap-1 mb-6" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning text-warning" aria-hidden="true" />
                  ))}
                </div>

                <blockquote className="text-foreground leading-relaxed mb-8">
                  "{testimonial.quote}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={`${testimonial.name}'s profile picture`}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-primary font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Glassmorphism */}
      <section className="py-24" aria-label="Get started">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-hero rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-10 right-10 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-10 left-10 w-56 h-56 bg-primary-foreground/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
            </div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                Ready to Launch<br />Your Career?
              </h2>
              <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of students and companies already using InternHub 
                to build meaningful connections and shape the future workforce.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="xl" variant="accent" className="shadow-accent-glow">
                  <Link to="/auth?mode=signup">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="hero-outline">
                  <Link to="/internships">
                    Browse Internships
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
