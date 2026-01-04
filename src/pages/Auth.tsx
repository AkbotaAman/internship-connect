import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';
import { 
  GraduationCap, 
  Building2, 
  Mail, 
  Lock, 
  User,
  Briefcase,
  ArrowLeft
} from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, user, profile } = useAuth();

  const initialMode = searchParams.get('mode') || 'signin';
  const initialRole = searchParams.get('role') as 'student' | 'company' | null;

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode as any);
  const [role, setRole] = useState<'student' | 'company'>(initialRole || 'student');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      const redirectPath = profile.role === 'company' 
        ? '/company/dashboard' 
        : profile.role === 'admin'
        ? '/admin/dashboard'
        : '/student/dashboard';
      navigate(redirectPath);
    }
  }, [user, profile, navigate]);

  const validateForm = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (mode === 'signup') {
        if (role === 'student' && !fullName.trim()) {
          toast.error('Please enter your full name');
          return false;
        }
        if (role === 'company' && !companyName.trim()) {
          toast.error('Please enter your company name');
          return false;
        }
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === 'signup') {
        const metadata = role === 'student' 
          ? { full_name: fullName }
          : { company_name: companyName };

        const { error } = await signUp(email, password, role, metadata);

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('Account created successfully! Redirecting...');
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('Welcome back!');
      }
    } catch (error: any) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center mx-auto mb-4 shadow-glow">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription>
                {mode === 'signin' 
                  ? 'Sign in to access your dashboard' 
                  : 'Join InternHub to start your journey'}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                  {/* Role Selection (Sign Up Only) */}
                  {mode === 'signup' && (
                    <div className="mb-6">
                      <Label className="text-sm text-muted-foreground mb-3 block">I am a...</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('student')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            role === 'student'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <GraduationCap className={`w-6 h-6 mx-auto mb-2 ${
                            role === 'student' ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <span className={`text-sm font-medium ${
                            role === 'student' ? 'text-primary' : 'text-foreground'
                          }`}>Student</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('company')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            role === 'company'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Building2 className={`w-6 h-6 mx-auto mb-2 ${
                            role === 'company' ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <span className={`text-sm font-medium ${
                            role === 'company' ? 'text-primary' : 'text-foreground'
                          }`}>Company</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Name Field (Sign Up Only) */}
                  {mode === 'signup' && (
                    <div className="mb-4">
                      <Label htmlFor="name" className="text-sm">
                        {role === 'student' ? 'Full Name' : 'Company Name'}
                      </Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder={role === 'student' ? 'John Doe' : 'Acme Inc.'}
                          value={role === 'student' ? fullName : companyName}
                          onChange={(e) => role === 'student' 
                            ? setFullName(e.target.value) 
                            : setCompanyName(e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="mb-4">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-6">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  {mode === 'signin' ? (
                    <>
                      Don't have an account?{' '}
                      <button 
                        onClick={() => setMode('signup')} 
                        className="text-primary hover:underline font-medium"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button 
                        onClick={() => setMode('signin')} 
                        className="text-primary hover:underline font-medium"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
