import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Briefcase, Building2, GraduationCap, CheckCircle2, Heart } from 'lucide-react';

type WaitlistType = 'student' | 'company';

export default function Waitlist() {
  const [type, setType] = useState<WaitlistType>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (type === 'company' && !companyName.trim()) {
      toast.error('Please enter your company name');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('waitlist').insert({
      type,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      company_name: type === 'company' ? companyName.trim() : null,
      message: message.trim() || null,
    });

    setLoading(false);
    if (error) {
      toast.error('Something went wrong. Please try again.');
      console.error(error);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-120px] right-[-80px] w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-60px] w-[250px] h-[250px] rounded-full bg-accent/5 blur-3xl" />

        <div className="max-w-md w-full text-center space-y-8 animate-fade-in relative z-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Intern<span className="text-primary">Hub</span>
            </span>
          </div>

          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">You're on the list! 🎉</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We'll notify <span className="text-foreground font-medium">{email}</span> as soon as we launch. Get ready for something great.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            Made with <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" /> by the InternHub team
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle decorative background elements */}
      <div className="absolute top-[-150px] right-[-100px] w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-120px] left-[-80px] w-[350px] h-[350px] rounded-full bg-accent/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-hero flex items-center justify-center shadow-lg shadow-primary/20">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              Intern<span className="text-primary">Hub</span>
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
              Your next internship<br />
              <span className="text-primary">starts here</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed">
              We're building the easiest way to find and land internships. Join the waitlist to get early access.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Toggle */}
          <div className="flex bg-muted/60 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setType('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                type === 'student'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setType('company')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                type === 'company'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Company
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={type === 'company' ? 'Your name' : 'e.g. Sarah Ahmed'}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {type === 'company' && (
              <div className="space-y-1.5 animate-fade-in">
                <label htmlFor="companyName" className="text-sm font-medium text-foreground">
                  Company name
                </label>
                <input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="message" className="text-sm font-medium text-foreground">
                Tell us more <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={type === 'student' ? 'What field interests you?' : 'What roles are you hiring for?'}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-sm shadow-primary/20 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Get Early Access
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            No spam, ever. We'll only email you when we launch.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
            Made with <Heart className="w-3 h-3 text-destructive/60 fill-destructive/60" /> by the InternHub team
          </div>
        </div>
      </div>
    </div>
  );
}
