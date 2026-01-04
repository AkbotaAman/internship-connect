import { Link } from 'react-router-dom';
import { Briefcase, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Intern<span className="text-gradient">Hub</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              Connecting talented students with amazing internship opportunities. 
              Start your career journey with InternHub today.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* For Students */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">For Students</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/internships" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Internships
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup&role=student" className="text-muted-foreground hover:text-primary transition-colors">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link to="/student/applications" className="text-muted-foreground hover:text-primary transition-colors">
                  My Applications
                </Link>
              </li>
            </ul>
          </div>

          {/* For Companies */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">For Companies</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/auth?mode=signup&role=company" className="text-muted-foreground hover:text-primary transition-colors">
                  Post Internships
                </Link>
              </li>
              <li>
                <Link to="/company/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Manage Listings
                </Link>
              </li>
              <li>
                <Link to="/company/applicants" className="text-muted-foreground hover:text-primary transition-colors">
                  View Applicants
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} InternHub. All rights reserved.</p>
            <span className="hidden sm:inline">•</span>
            <p>Built by <span className="font-semibold text-foreground">A² Solutions</span></p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
