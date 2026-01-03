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
  Globe
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
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
            {internship.company_profiles.logo_url ? (
              <img 
                src={internship.company_profiles.logo_url} 
                alt={internship.company_profiles.company_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-7 h-7 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link 
                  to={`/internships/${internship.id}`}
                  className="text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                >
                  {internship.title}
                </Link>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {internship.company_profiles.company_name}
                </p>
              </div>
              {isNew && (
                <Badge variant="default" className="bg-success text-success-foreground flex-shrink-0">
                  New
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground text-sm mt-3 line-clamp-2">
              {internship.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="gap-1">
                {internship.is_remote ? (
                  <>
                    <Globe className="w-3 h-3" />
                    Remote
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3" />
                    {internship.location}
                  </>
                )}
              </Badge>
              {internship.duration && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {internship.duration}
                </Badge>
              )}
              <Badge 
                variant="secondary" 
                className={internship.is_paid ? 'bg-success/10 text-success' : ''}
              >
                <DollarSign className="w-3 h-3" />
                {internship.is_paid ? 'Paid' : 'Unpaid'}
              </Badge>
              {internship.industry && (
                <Badge variant="outline">
                  {internship.industry}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Posted {formatDistanceToNow(new Date(internship.created_at), { addSuffix: true })}
          </span>
          {internship.application_deadline && (
            <span>
              Deadline: {new Date(internship.application_deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        <Button asChild size="sm">
          <Link to={`/internships/${internship.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
