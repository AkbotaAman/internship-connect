import { Link } from 'react-router-dom';
import { Briefcase, Github, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border relative" role="contentinfo">
      <div className="absolute inset-0 bg-mesh opacity-20" />
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group" aria-label="InternHub home">
              <div className="w-11 h-11 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300">
                <Briefcase className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold">
                Intern<span className="text-gradient">Hub</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed mb-6">
              The modern, accessible platform connecting talented students with 
              innovative companies. Start your career journey with InternHub today.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-muted-foreground transition-all duration-300"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-5 h-5" aria-hidden="true" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-muted-foreground transition-all duration-300"
                aria-label="Connect on LinkedIn"
              >
                <Linkedin className="w-5 h-5" aria-hidden="true" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-muted-foreground transition-all duration-300"
                aria-label="View our GitHub"
              >
                <Github className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* For Students */}
          <nav aria-label="Student resources">
            <h4 className="font-semibold text-foreground mb-6 text-lg">For Students</h4>
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/internships" 
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  Browse Internships
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/auth?mode=signup&role=student" 
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  Create Profile
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/student/applications" 
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  My Applications
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </nav>

          {/* For Companies */}
          <nav aria-label="Company resources">
            <h4 className="font-semibold text-foreground mb-6 text-lg">For Companies</h4>
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/auth?mode=signup&role=company" 
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  Post Internships
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/company/dashboard" 
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  Manage Listings
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/company/applicants" 
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  View Applicants
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} InternHub. All rights reserved.</p>
            <span className="hidden sm:inline text-border">•</span>
            <p>Built with care by <span className="font-semibold text-foreground">A² Solutions</span></p>
          </div>
          <div className="flex gap-8 text-sm">
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
