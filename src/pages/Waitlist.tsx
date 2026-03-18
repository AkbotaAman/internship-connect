import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Briefcase, CheckCircle2 } from 'lucide-react';

export default function Waitlist() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('waitlist').select('id', { count: 'exact', head: true }).then(({ count: c }) => {
      setCount(c ?? 0);
    });
  }, []);

  const displayCount = count !== null ? Math.max(count, 700) : 700;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const { error } = await supabase.from('waitlist').insert({
      type: 'student',
      full_name: '',
      email: email.trim().toLowerCase(),
    });

    setLoading(false);
    if (error) {
      if (error.code === '23505') {
        toast.error('This email is already on the waitlist!');
      } else {
        toast.error('Something went wrong. Try again.');
      }
    } else {
      setSubmitted(true);
      setCount((c) => (c ?? 0) + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 relative">
      {/* Single soft glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full text-center space-y-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Briefcase className="w-[18px] h-[18px] text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground tracking-tight">
            InternHub
          </span>
        </div>

        {submitted ? (
          <div className="space-y-5 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-2xl font-semibold text-foreground">You're in!</h1>
            <p className="text-muted-foreground leading-relaxed">
              We'll let you know at <span className="text-foreground font-medium">{email}</span> when it's time.
            </p>
          </div>
        ) : (
          <>
            {/* Copy */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <h1 className="text-3xl sm:text-[2.5rem] font-bold text-foreground tracking-tight leading-[1.15]">
                Land your dream<br />internship
              </h1>
              <p className="text-muted-foreground text-[15px] leading-relaxed max-w-xs mx-auto">
                The simplest way to discover and apply for internships. Sign up for early access.
              </p>
            </div>

            {/* Single input + button */}
            <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-[15px] hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Join the Waitlist
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social proof */}
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{displayCount.toLocaleString()}+</span> people already signed up
            </p>
          </>
        )}
      </div>
    </div>
  );
}
