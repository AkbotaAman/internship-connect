import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2,
  Calendar,
  Globe,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface InternshipCardProps {
  internship: {
    id: string;
    title: string;
    description: string;
    location: string;
    is_remote: boolean;
    is_paid: boolean;
    duration: string;
    industry: string;
    application_deadline: string | null;
    created_at: string;
    company_profiles: {
      company_name: string;
      logo_url: string | null;
      industry: string;
    };
  };
}

export function InternshipCard({ internship }: InternshipCardProps) {
  const isNew = new Date(internship.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return (
    <Card className="group glass-card hover-lift overflow-hidden border-border/50 rounded-2xl transition-all duration-300 hover:border-primary/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-5">
          {/* Company Logo */}
          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-border/50 transition-all duration-300 group-hover:ring-primary/30 group-hover:scale-105">
            {internship.company_profiles.logo_url ? (
              <img 
                src={internship.company_profiles.logo_url} 
                alt={`${internship.company_profiles.company_name} logo`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <Building2 className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link 
                  to={`/internships/${internship.id}`}
                  className="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 focus-visible:outline-none focus-visible:underline"
                >
                  {internship.title}
                </Link>
                <p className="text-muted-foreground text-sm mt-1 font-medium">
                  {internship.company_profiles.company_name}
                </p>
              </div>
              {isNew && (
                <Badge variant="default" className="bg-success text-success-foreground flex-shrink-0 rounded-full px-3">
                  New
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground text-sm mt-4 line-clamp-2 leading-relaxed">
              {internship.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
                {internship.is_remote ? (
                  <>
                    <Globe className="w-3 h-3" aria-hidden="true" />
                    Remote
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {internship.location}
                  </>
                )}
              </Badge>
              {internship.duration && (
                <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {internship.duration}
                </Badge>
              )}
              <Badge 
                variant="secondary" 
                className={`gap-1.5 rounded-full px-3 py-1 ${internship.is_paid ? 'bg-success/10 text-success border-success/20' : ''}`}
              >
                <DollarSign className="w-3 h-3" aria-hidden="true" />
                {internship.is_paid ? 'Paid' : 'Unpaid'}
              </Badge>
              {internship.industry && (
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  {internship.industry}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 bg-secondary/30 flex items-center justify-between border-t border-border/30">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            Posted {formatDistanceToNow(new Date(internship.created_at), { addSuffix: true })}
          </span>
          {internship.application_deadline && (
            <span className="text-warning font-medium">
              Deadline: {new Date(internship.application_deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        <Button asChild size="sm" className="group/btn rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
          <Link to={`/internships/${internship.id}`}>
            View Details
            <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform duration-300" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
