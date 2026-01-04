import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Briefcase, 
  User, 
  LogOut, 
  Menu, 
  X,
  Building2,
  GraduationCap,
  LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!profile) return '/';
    switch (profile.role) {
      case 'student':
        return '/student/dashboard';
      case 'company':
        return '/company/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="InternHub home">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300">
              <Briefcase className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Intern<span className="text-gradient">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/internships" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium relative group"
            >
              Browse Internships
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
            {user && profile?.role === 'company' && (
              <Link 
                to="/company/internships/new" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium relative group"
              >
                Post Internship
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-3 pl-2 pr-4" aria-label="User menu">
                    <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                      {profile?.role === 'company' ? (
                        <Building2 className="w-4 h-4 text-primary-foreground" aria-hidden="true" />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-primary-foreground" aria-hidden="true" />
                      )}
                    </div>
                    <span className="max-w-32 truncate font-medium">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card rounded-xl p-2">
                  <DropdownMenuItem 
                    onClick={() => navigate(getDashboardLink())} 
                    className="rounded-lg cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-3" aria-hidden="true" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate(profile?.role === 'company' ? '/company/profile' : '/student/profile')}
                    className="rounded-lg cursor-pointer"
                  >
                    <User className="w-4 h-4 mr-3" aria-hidden="true" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="text-destructive rounded-lg cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-3" aria-hidden="true" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth?mode=signin')} className="font-medium">
                  Sign In
                </Button>
                <Button variant="accent" onClick={() => navigate('/auth?mode=signup')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-border/50 animate-fade-in" role="menu">
            <div className="flex flex-col gap-2">
              <Link 
                to="/internships" 
                className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
                role="menuitem"
              >
                Browse Internships
              </Link>
              {user && profile?.role === 'company' && (
                <Link 
                  to="/company/internships/new" 
                  className="px-4 py-3 text-foreground hover:bg-secondary rounded-xl transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  role="menuitem"
                >
                  Post Internship
                </Link>
              )}
              <div className="border-t border-border/50 pt-4 mt-2">
                {user ? (
                  <>
                    <Link 
                      to={getDashboardLink()}
                      className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-xl font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                      role="menuitem"
                    >
                      <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl font-medium mt-2"
                      role="menuitem"
                    >
                      <LogOut className="w-5 h-5" aria-hidden="true" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 px-4">
                    <Button 
                      variant="outline" 
                      onClick={() => { navigate('/auth?mode=signin'); setMobileMenuOpen(false); }}
                      className="w-full justify-center"
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="accent" 
                      onClick={() => { navigate('/auth?mode=signup'); setMobileMenuOpen(false); }}
                      className="w-full justify-center"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
